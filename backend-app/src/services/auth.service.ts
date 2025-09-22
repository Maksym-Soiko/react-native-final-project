import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { UserRepository } from "../repositories/user.repository";
import { RegisterUserDto, LoginUserDto, UserResponseDto } from "../dtos/user.dto";
import { ConflictError, NotFoundError, ValidationError } from "../errors/app-err";
import bcrypt from "bcryptjs";
import { UserDocument } from "../models/user.schema";

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new ConflictError("Email already exists");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return toUserResponseDto(user);
  }

  async login(dto: LoginUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new NotFoundError("User not found");

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new ValidationError("Invalid credentials");

    return toUserResponseDto(user);
  }
}

function toUserResponseDto(user: UserDocument): UserResponseDto {
  return {
    id: user._id.toHexString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}