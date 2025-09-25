import { injectable } from "inversify";
import { OffenseModel, OffenseDocument } from "../models/offense.schema";
import { CreateOffenseDto } from "../dtos/offense.dto";

@injectable()
export class OffenseRepository {
    async create(dto: CreateOffenseDto): Promise<OffenseDocument> {
        const doc = new OffenseModel({
            description: dto.description,
            category: dto.category,
            photoUrl: dto.photoUrl,
            dateTime: new Date(dto.dateTime),
            userId: dto.userId,
            location: { type: "Point", coordinates: [dto.location.lng, dto.location.lat] },
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
        const start = new Date(date + "T00:00:00.000Z");
        const end = new Date(date + "T23:59:59.999Z");
        return OffenseModel.find({ dateTime: { $gte: start, $lte: end } }).sort({ dateTime: -1 }).exec();
    }

    async findByLocation(lat: number, lng: number, radiusKm = 1): Promise<OffenseDocument[]> {
        const meters = Math.round(radiusKm * 1000);
        return OffenseModel.find({
            location: {
                $nearSphere: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: meters,
                },
            },
        }).exec();
    }
}