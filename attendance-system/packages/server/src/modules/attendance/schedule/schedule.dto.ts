import { IsInt, IsString, IsBoolean, IsOptional, IsArray, IsPositive, Matches } from 'class-validator';
import { CreateScheduleDto, BatchCreateScheduleDto } from '@attendance/shared';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class CreateScheduleReqDto implements CreateScheduleDto {
  @IsInt()
  @IsPositive()
  employeeId: number;

  @IsInt()
  @IsPositive()
  shiftId: number;

  @IsString()
  @Matches(DATE_REGEX, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate: string;

  @IsString()
  @Matches(DATE_REGEX, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class BatchCreateScheduleReqDto implements BatchCreateScheduleDto {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  departmentIds: number[];

  @IsInt()
  @IsPositive()
  shiftId: number;

  @IsString()
  @Matches(DATE_REGEX, { message: 'startDate must be in YYYY-MM-DD format' })
  startDate: string;

  @IsString()
  @Matches(DATE_REGEX, { message: 'endDate must be in YYYY-MM-DD format' })
  endDate: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;

  @IsBoolean()
  @IsOptional()
  includeSubDepartments?: boolean;
}
