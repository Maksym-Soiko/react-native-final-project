import mongoose from "mongoose";
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
    if (mongoose.Types.ObjectId.isValid(id)) {
      return UserModel.findByIdAndUpdate(id, dto, {
        new: true,
        projection: { __v: 0 },
      }).exec();
    }

    if (id.includes("@")) {
      return UserModel.findOneAndUpdate({ email: id }, dto, {
        new: true,
        projection: { __v: 0 },
      }).exec();
    }

    return null;
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return UserModel.findById(id, { __v: 0 }).exec();
    }

    if (id.includes("@")) {
      return UserModel.findOne({ email: id }, { __v: 0 }).exec();
    }

    return null;
  }
}