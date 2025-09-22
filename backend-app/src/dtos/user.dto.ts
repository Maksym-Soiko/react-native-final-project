import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @Length(2, 50, { message: "Name must be between 2 and 50 characters" })
  @IsString()
  firstName?: string;

  @IsOptional()
  @Length(2, 50, { message: "Last name must be between 2 and 50 characters" })
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: "Email must be valid" })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password?: string;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: "Name is required" })
  @Length(2, 50, { message: "Name must be between 2 and 50 characters" })
  @IsString()
  firstName!: string;

  @IsNotEmpty({ message: "Last name is required" })
  @Length(2, 50, { message: "Last name must be between 2 and 50 characters" })
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsEmail({}, { message: "Email must be valid" })
  email!: string;

  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail({}, { message: "Email must be valid" })
  email!: string;

  @IsNotEmpty()
  password!: string;
}

export class UserResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
}