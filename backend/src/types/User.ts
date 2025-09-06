import { IsEmail, IsNotEmpty, Length, IsOptional} from "class-validator";

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