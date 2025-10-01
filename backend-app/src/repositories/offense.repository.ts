import { injectable } from "inversify";
import { OffenseModel, OffenseDocument } from "../models/offense.schema";
import { CreateOffenseDto } from "../dtos/offense.dto";
import { ValidationError } from "../errors/app-err";

@injectable()
export class OffenseRepository {
  async create(dto: CreateOffenseDto): Promise<OffenseDocument> {
    let dateObj: Date;
    if (
      typeof dto.dateTime === "object" &&
      dto.dateTime !== null &&
      Object.prototype.toString.call(dto.dateTime) === "[object Date]"
    ) {
      dateObj = dto.dateTime as Date;
    } else {
      dateObj = new Date(String(dto.dateTime ?? ""));
    }
    if (isNaN(dateObj.getTime())) {
      throw new ValidationError("Invalid dateTime");
    }

    let coords: [number, number] | null = null;
    if (
      dto.location &&
      typeof dto.location.lat === "number" &&
      typeof dto.location.lng === "number"
    ) {
      coords = [dto.location.lat, dto.location.lng];
    } else {
      throw new ValidationError("Invalid location (lat/lng required)");
    }

    const doc = new OffenseModel({
      description: dto.description,
      category: dto.category,
      photoUrl: dto.photoUrl,
      dateTime: dateObj,
      userId: dto.userId,
      location: { type: "Point", coordinates: coords },
    });
    return doc.save();
  }

  async findDates(): Promise<string[]> {
    const res = await OffenseModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateTime" } },
        },
      },
      { $sort: { _id: -1 } },
      { $project: { date: "$_id", _id: 0 } },
    ]).exec();
    return res.map((r: any) => r.date);
  }

  async findByDate(date: string): Promise<OffenseDocument[]> {
    const raw = String(date ?? "").trim();
    if (!raw) {
      throw new ValidationError("Missing date parameter");
    }

    const maybe = new Date(raw);
    if (!isNaN(maybe.getTime())) {
      const y = maybe.getUTCFullYear();
      const mo = maybe.getUTCMonth();
      const day = maybe.getUTCDate();
      const start = new Date(Date.UTC(y, mo, day, 0, 0, 0, 0));
      const end = new Date(Date.UTC(y, mo, day, 23, 59, 59, 999));
      return OffenseModel.find({ dateTime: { $gte: start, $lte: end } })
        .sort({ dateTime: -1 })
        .exec();
    }

    const m = raw.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) {
      const dOnly = new Date(m[1] + "T00:00:00Z");
      if (!isNaN(dOnly.getTime())) {
        const y = dOnly.getUTCFullYear();
        const mo = dOnly.getUTCMonth();
        const day = dOnly.getUTCDate();
        const start = new Date(Date.UTC(y, mo, day, 0, 0, 0, 0));
        const end = new Date(Date.UTC(y, mo, day, 23, 59, 59, 999));
        return OffenseModel.find({ dateTime: { $gte: start, $lte: end } })
          .sort({ dateTime: -1 })
          .exec();
      }
    }
    throw new ValidationError("Invalid date parameter. Use ISO or YYYY-MM-DD");
  }

  async findByLocation(
    lat: number,
    lng: number,
    radiusKm = 1
  ): Promise<OffenseDocument[]> {
    const meters = Math.round(radiusKm * 1000);
    return OffenseModel.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lat, lng] },
          $maxDistance: meters,
        },
      },
    }).exec();
  }
}