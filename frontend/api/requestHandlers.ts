import {
    useMutation,
    useQuery,
    UseQueryOptions,
    UseQueryResult,
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
