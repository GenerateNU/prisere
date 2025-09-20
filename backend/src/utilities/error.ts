import Boom from "@hapi/boom";
import { ErrorHandler, Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logMessageToFile, logObjectToFile } from "./logger";
import { z } from "zod";

export const withServiceErrorHandling = <T extends any[], R>(handler: (...args: T) => Promise<R>) => {
    return async (...args: T): Promise<R> => {
        try {
            return await handler(...args);
        } catch (error: any) {
            if (error.isBoom?.()) {
                throw error;
            } else if (error?.name === "QueryFailedError") {
                switch (error.code) {
                    case "23505":
                        throw Boom.conflict("Resource already exists");
                    case "23503":
                        throw Boom.badRequest("Invalid reference");
                    case "23502":
                        throw Boom.badRequest("Missing required field");
                    default:
                        throw Boom.internal(error, { message: "An expected error occured" });
                }
            } else {
                throw Boom.boomify(error);
            }
        }
    };
};

export const withControllerErrorHandling = <T extends any[], R>(handler: (ctx: Context, ...args: T) => Promise<R>) => {
    return async (ctx: Context, ...args: T) => {
        try {
            return await handler(ctx, ...args);
        } catch (error) {
            if (Boom.isBoom(error)) {
                return ctx.json(
                    { error: error.output.payload.message },
                    error.output.statusCode as 400 // instead of ContentfulErrorCode, we need to bound it to 400 or 500 so the types don't blow up down the road
                );
            }
            if (error instanceof z.ZodError) {
                return ctx.json({ error: z.prettifyError(error) }, 400);
            }

            // log unknown errors:
            if (error instanceof Error) {
                logErrors(error, ctx);
            } else if (error instanceof Object) {
                logObjectToFile(error);
            } else {
                logMessageToFile("Unknown error occured");
            }

            return ctx.json({ error: "Internal Server Error" }, 500);
        }
    };
};

export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
    logErrors(err, c);

    if (err instanceof HTTPException) {
        return c.json(
            {
                error: err.message,
                status: err.status,
            },
            err.status
        );
    }

    return c.json(
        {
            error: "Internal Server Error",
            ...(process.env.NODE_ENV === "development" && {
                details: err.message,
                stack: err.stack,
            }),
        },
        500
    );
};

const logErrors = (err: Error, c: Context) => {
    const includeStack = process.env.NODE_ENV === "development";
    console.error("Error occurred:", {
        message: err.message,
        ...(includeStack && {
            stack: err.stack,
        }),
        path: c.req.path,
        method: c.req.method,
        timestamp: new Date().toISOString(),
    });

    logMessageToFile(
        "Error occurred:",
        `message: ${err.message}`,
        ...(includeStack ? [`stack: ${err.stack}`] : []),
        `path: ${c.req.path}`,
        `method: ${c.req.method}`,
        `timestamp: ${new Date().toISOString()}`
    );
};

export function openApiErrorCodes(description: string) {
    return {
        400: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description,
        },
        500: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description,
        },
    };
}
