import {IsNotEmpty, IsString, IsOptional, IsDateString, ValidateNested, IsNumber} from "class-validator";
import { Type } from "class-transformer";

export class LocationDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    lat!: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    lng!: number;
}

export class CreateOffenseDto {
    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsString()
    category!: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsNotEmpty()
    @IsDateString()
    dateTime!: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @ValidateNested()
    @Type(() => LocationDto)
    location!: LocationDto;
}

export class LocationQueryDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    lat!: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    lng!: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    radius?: number;
}

export class OffenseResponseDto {
    id!: string;
    description!: string;
    category!: string;
    photoUrl?: string;
    dateTime!: string;
    userId!: string;
    location!: { lat: number; lng: number };
}