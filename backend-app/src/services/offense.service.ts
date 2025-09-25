import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { OffenseRepository } from "../repositories/offense.repository";
import { CreateOffenseDto, OffenseResponseDto } from "../dtos/offense.dto";
import { OffenseDocument } from "../models/offense.schema";

@injectable()
export class OffenseService {
  constructor(
    @inject(TYPES.OffenseRepository)
    private offenseRepository: OffenseRepository
  ) {}

  async create(dto: CreateOffenseDto): Promise<OffenseResponseDto> {
    const offense = await this.offenseRepository.create(dto);
    return toOffenseResponseDto(offense);
  }

  async getDates(): Promise<string[]> {
    return this.offenseRepository.findDates();
  }

  async getByDate(date: string): Promise<OffenseResponseDto[]> {
    const offenses = await this.offenseRepository.findByDate(date);
    return offenses.map(toOffenseResponseDto);
  }

  async getByLocation(
    lat: number,
    lng: number,
    radiusKm?: number
  ): Promise<OffenseResponseDto[]> {
    const offenses = await this.offenseRepository.findByLocation(
      lat,
      lng,
      radiusKm
    );
    return offenses.map(toOffenseResponseDto);
  }
}

function toOffenseResponseDto(offense: OffenseDocument): OffenseResponseDto {
  const loc = (offense as any).location || {};
  let lat: number | null = null;
  let lng: number | null = null;

  if (typeof loc.lat === "number" && typeof loc.lng === "number") {
    lat = loc.lat;
    lng = loc.lng;
  } else if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    lng = Number(loc.coordinates[0]);
    lat = Number(loc.coordinates[1]);
  } else if (Array.isArray((offense as any).coords) && (offense as any).coords.length >= 2) {
    lng = Number((offense as any).coords[0]);
    lat = Number((offense as any).coords[1]);
  }

  return {
    id: (offense._id as any).toHexString ? (offense._id as any).toHexString() : String((offense._id as any)),
    description: offense.description,
    category: offense.category,
    photoUrl: offense.photoUrl,
    dateTime: offense.dateTime.toISOString(),
    userId: (offense.userId as any)?.toHexString ? (offense.userId as any).toHexString() : String(offense.userId),
    location: { lat: lat as number, lng: lng as number },
  };
}