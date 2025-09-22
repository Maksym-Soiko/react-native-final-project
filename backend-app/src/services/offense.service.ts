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
  return {
    id: offense._id.toHexString(),
    description: offense.description,
    category: offense.category,
    photoUrl: offense.photoUrl,
    dateTime: offense.dateTime.toISOString(),
    userId: offense.userId.toHexString(),
    location: { lat: offense.location.lat, lng: offense.location.lng },
  };
}