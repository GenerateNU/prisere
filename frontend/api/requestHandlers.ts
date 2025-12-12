import {
    useMutation,
    useQuery,
    useQueries,
    useInfiniteQuery,
    UseQueryOptions,
    UseQueryResult,
    UseInfiniteQueryResult,
    InfiniteData,
    QueryFunctionContext,
    type UseMutationOptions,
    type UseMutationResult,
    type QueryKey,
    type QueryFunction,
} from "@tanstack/react-query";
import { ServerActionResult } from "./types";

// Helper to check if result is an error
function isServerActionError<TData>(result: ServerActionResult<TData>): result is { success: false; error: string } {
    return !result.success;
}

// Custom hook that mimics useMutation's interface
export function useServerActionMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
    options: Omit<UseMutationOptions<ServerActionResult<TData>, TError, TVariables, TContext>, "onSuccess"> & {
        onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
    }
): UseMutationResult<ServerActionResult<TData>, TError, TVariables, TContext> {
    const { onSuccess, ...restOptions } = options;

    const mutation = useMutation<ServerActionResult<TData>, TError, TVariables, TContext>({
        ...restOptions,
        mutationFn: async (variables, context) => {
            if (!options.mutationFn) {
                throw new Error("mutationFn is required");
            }

            const result = await options.mutationFn(variables, context);

            // Throw on error to trigger onError handler
            if (isServerActionError(result)) {
                throw result.error as TError;
            }

            return result;
        },
        onSuccess: (data, variables, context) => {
            // Extract the actual data before passing to onSuccess
            if (!isServerActionError(data)) {
                onSuccess?.(data.data, variables, context);
            }
        },
    });

    return mutation;
}

// Custom hook that mimics useQuery's interface
export function useServerActionQuery<TData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey>(
    options: Omit<UseQueryOptions<ServerActionResult<TData>, TError, TData, TQueryKey>, "select"> & {
        select?: (data: TData) => TData;
    }
): UseQueryResult<TData, TError> {
    const { select, ...restOptions } = options;

    const query = useQuery<ServerActionResult<TData>, TError, TData, TQueryKey>({
        ...restOptions,
        queryFn: options.queryFn
            ? async (context) => {
                  // Type guard to ensure it's a function
                  const queryFn = options.queryFn as QueryFunction<ServerActionResult<TData>, TQueryKey>;
                  const result = await queryFn(context);

                  // Throw on error to trigger error state
                  if (isServerActionError(result)) {
                      throw result.error as TError;
                  }

                  return result;
              }
            : undefined,
        select: (data) => {
            // Unwrap the data
            if (!isServerActionError(data)) {
                const unwrapped = data.data;
                // Apply user's select if provided
                return select ? select(unwrapped) : unwrapped;
            }
            // This shouldn't happen due to queryFn throw, but TypeScript needs it
            throw new Error("Unexpected error state");
        },
    });

    return query;
}

// Custom hook for useQueries that unwraps ServerActionResult
export function useServerActionQueries<
    TData = unknown,
    TError = unknown,
    TQueryKey extends QueryKey = QueryKey,
>(options: {
    queries: Array<
        Omit<UseQueryOptions<ServerActionResult<TData>, TError, TData, TQueryKey>, "select"> & {
            select?: (data: TData) => TData;
        }
    >;
}) {
    return useQueries({
        queries: options.queries.map((queryOptions) => ({
            ...queryOptions,
            queryFn: queryOptions.queryFn
                ? async (context: Parameters<QueryFunction<ServerActionResult<TData>, TQueryKey>>[0]) => {
                      const queryFn = queryOptions.queryFn as QueryFunction<ServerActionResult<TData>, TQueryKey>;
                      const result = await queryFn(context);

                      if (isServerActionError(result)) {
                          throw result.error as TError;
                      }

                      return result;
                  }
                : undefined,
            select: (data: ServerActionResult<TData>) => {
                if (!isServerActionError(data)) {
                    const unwrapped = data.data;
                    return queryOptions.select ? queryOptions.select(unwrapped) : unwrapped;
                }
                throw new Error("Unexpected error state");
            },
        })),
    });
}

// Custom hook for useInfiniteQuery that unwraps ServerActionResult
// Note: This hook unwraps ServerActionResult in queryFn, so getNextPageParam receives the unwrapped TData
export function useServerActionInfiniteQuery<
    TData = unknown,
    TError = unknown,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = unknown,
>(options: {
    queryKey: TQueryKey;
    queryFn: (context: { pageParam: TPageParam }) => Promise<ServerActionResult<TData>>;
    getNextPageParam: (lastPage: TData, allPages: TData[]) => TPageParam | undefined;
    initialPageParam: TPageParam;
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
    refetchOnReconnect?: boolean;
    retry?: boolean | number;
}): UseInfiniteQueryResult<InfiniteData<TData>, TError> {
    const { queryFn, ...restOptions } = options;

    return useInfiniteQuery({
        ...restOptions,
        queryFn: async (context: QueryFunctionContext<TQueryKey, TPageParam>) => {
            const result = await queryFn({ pageParam: context.pageParam as TPageParam });

            if (isServerActionError(result)) {
                throw result.error as TError;
            }

            return result.data;
        },
    }) as UseInfiniteQueryResult<InfiniteData<TData>, TError>;
}
