import { z } from "zod";

export const ErrorResponseSchema = z.object({
  error: z.string()
});