import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
      email?: string;
}


export class CreateUserResponse {
    id!: string;
    email?: string;
}

export type CreateUserAPIResponse = CreateUserResponse | { error: string };