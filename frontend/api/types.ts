export type ServerActionResult<TData> = 
| { success: true; data: TData }
| { success: false; error: string };

// Type guard to check if result is successful
export function isServerActionSuccess<TData>(
    result: ServerActionResult<TData>
): result is { success: true; data: TData } {
    return result.success === true;
}

// Type guard to check if result is an error
export function isServerActionError<TData>(
    result: ServerActionResult<TData>
): result is { success: false; error: string } {
    return result.success === false;
}
