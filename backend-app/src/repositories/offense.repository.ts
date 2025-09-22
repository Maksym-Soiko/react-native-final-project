import { injectable } from "inversify";
import { OffenseModel, OffenseDocument } from "../models/offense.schema";
import { CreateOffenseDto } from "../dtos/offense.dto";

@injectable()
export class OffenseRepository {
  async create(dto: CreateOffenseDto): Promise<OffenseDocument> {
    const offense = new OffenseModel({
      description: dto.description,
      category: dto.category,
      photoUrl: dto.photoUrl,
      dateTime: dto.dateTime,
      userId: dto.userId,
      location: { lat: dto.lat, lng: dto.lng },
    });
    return offense.save();
  }

  async findDates(): Promise<string[]> {
    const offenses = await OffenseModel.find({}, { dateTime: 1 }).exec();
    return offenses.map((o) => o.dateTime.toISOString().split("T")[0]);
  }

  async findByDate(date: string): Promise<OffenseDocument[]> {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    return OffenseModel.find({
      dateTime: { $gte: start, $lt: end },
    }).exec();
  }

  async findByLocation(
    lat: number,
    lng: number,
    radiusKm = 1
  ): Promise<OffenseDocument[]> {
    const radiusInDegrees = radiusKm / 111;
    return OffenseModel.find({
      "location.lat": {
        $gte: lat - radiusInDegrees,
        $lte: lat + radiusInDegrees,
      },
      "location.lng": {
        $gte: lng - radiusInDegrees,
        $lte: lng + radiusInDegrees,
      },
    }).exec();
  }
}