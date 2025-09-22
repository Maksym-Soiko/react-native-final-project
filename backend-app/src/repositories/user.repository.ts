import { UserDocument, UserModel } from "../models/user.schema";
import { UpdateUserDto, RegisterUserDto } from "../dtos/user.dto";
import { injectable } from "inversify";

@injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  async create(dto: RegisterUserDto): Promise<UserDocument> {
    const user = new UserModel(dto);
    return user.save();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, dto, {
      new: true,
      projection: { __v: 0 },
    }).exec();
  }
}