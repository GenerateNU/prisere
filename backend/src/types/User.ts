import { IsEmail, IsNotEmpty, Length, IsOptional } from "class-validator";
import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

export class CreateUserDTO {
  @IsNotEmpty()
  @Length(3, 20)
      firstName!: string;

  @IsNotEmpty()
      lastName!: string;

  @IsOptional()
  @IsEmail()
      email?: string;
}


export class CreateUserResponse {
    id!: string;
    firstName!: string;
    lastName!:string;
    email?: string;
}

export type CreateUserAPIResponse = CreateUserResponse | { error: string };

// Zod schemae for OpenAPI docs

export const CreateUserDTOSchema = z.object({
  firstName: z.string().min(3).max(20),
  lastName: z.string().min(1),
  email: z.string().email().optional()
});

export const CreateUserResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional()
});

export const CreateUserAPIResponseSchema = z.union([
  CreateUserResponseSchema,
  ErrorResponseSchema
]);