import { UpdateUserDto, UserResponseDto } from "../dtos/user.dto";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { UserRepository } from "../repositories/user.repository";
import { UserDocument } from "../models/user.schema";
import { NotFoundError } from "../errors/app-err";
import bcrypt from "bcryptjs";

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {}

  async updateById(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const updateData: Partial<UpdateUserDto> = { ...dto };

    if (dto.password) {
      const hashed = await bcrypt.hash(dto.password, 10);
      updateData.password = hashed;
    }

    const user = await this.userRepository.update(
      id,
      updateData as UpdateUserDto
    );
    if (!user) throw new NotFoundError("User not found");
    return toUserResponseDto(user, true);
  }

  async getById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return toUserResponseDto(user, true);
  }
}

function toUserResponseDto(
  user: UserDocument,
  includeEmail = false
): UserResponseDto {
  const id =
    (user as any)?._id?.toString?.() ??
    (user as any)?.id ??
    String((user as any)?._id ?? "");

  const dto: UserResponseDto = {
    id,
    firstName: (user as any).firstName ?? "",
    lastName: (user as any).lastName ?? "",
    email: includeEmail ? user.email : "",
  };

  return dto;
}