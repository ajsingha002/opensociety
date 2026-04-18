import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Length,
  IsInt,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums matching your Prisma Schema
export enum ResidenceStatus {
  RESIDING_OWNER = 'RESIDING_OWNER',
  TENANT = 'TENANT',
}

export enum Wing {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dob: string;

  @IsEnum(ResidenceStatus)
  residenceStatus: ResidenceStatus;

  @IsEnum(Wing) // Changed from IsString to IsEnum
  wing: Wing;

  @IsInt() // Changed from IsString to IsInt
  @Min(1)
  @Type(() => Number) // Ensures the string from the request is transformed to a number
  flatNumber: number;

  @IsEmail()
  email: string;

  @IsString()
  @Length(10, 10)
  phoneNumber: string;

  @IsString()
  @Length(8, 20)
  password: string;
}