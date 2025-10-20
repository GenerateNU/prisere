import { TypedResponse } from "hono";

type ErrorResponse = { error: string };

export type ControllerResponse<T extends TypedResponse> = Promise<
    T | TypedResponse<ErrorResponse, 400> | TypedResponse<ErrorResponse, 500>
>;
