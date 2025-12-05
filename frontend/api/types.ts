export type ServerActionResult<TData> = 
| { success: true; data: TData }
| { success: false; error: string };
