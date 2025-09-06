import Boom from "@hapi/boom";
import { ErrorHandler, Context} from "hono";
import { ValidationError } from "class-validator";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from 'hono/http-exception';
import { logToFile } from "./logger";

export const handleServiceError = async (fn: () => Promise<any>) => {
    try {
        return await fn();
      } catch (error:any) {
        if(error.isBoom()){
            throw error;
        }
        else if (error?.name === 'QueryFailedError') {
            switch (error.code) {
                case '23505': 
                throw Boom.conflict('Resource already exists');
                case '23503':
                throw Boom.badRequest('Invalid reference');
                case '23502':
                throw Boom.badRequest('Missing required field');
                default:
                throw Boom.internal(error, { message: 'An expected error occured' });
            }
        } else{
            throw Boom.boomify(error);
        }
      }
};

export const handleAppError = <T>(thunk: () => T) => {
    return async (ctx: Context) => {
      try {
        return await thunk();
      } catch (error) {
        if (Boom.isBoom(error)) {
          return ctx.json({error: error.output.payload.message}, error.output.statusCode as ContentfulStatusCode);
        }
        if (Array.isArray(error) && error[0] instanceof ValidationError) {
          const messages = error.map((err: ValidationError) =>
            Object.values(err.constraints || {}).join(", ")
          ).join("; ");
          return ctx.json({ error: messages }, 400);
        }
        return ctx.json({ error: "Internal Server Error" }, 500);
      }
    };
  };

export const errorHandler: ErrorHandler = (err: Error, c: Context) => {
    logErrors(err, c)

    if (err instanceof HTTPException) {
        return c.json({
            error: err.message,
            status: err.status
        }, err.status);
    }

    return c.json({
        error: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            details: err.message,
            stack: err.stack
        })
    }, 500);
}

const logErrors = (err: Error, c: Context) => {
  const includeStack = process.env.NODE_ENV === 'development'
  console.error('Error occurred:', {
                message: err.message,
                ...(includeStack && {
                  stack: err.stack,
                }),
                path: c.req.path,
                method: c.req.method,
                timestamp: new Date().toISOString()
  });

  logToFile(
    'Error occurred:',
    `message: ${err.message}`,
    ...(includeStack ? [`stack: ${err.stack}`] : []),
    `path: ${c.req.path}`,
    `method: ${c.req.method}`,
    `timestamp: ${new Date().toISOString()}`
  );
}
