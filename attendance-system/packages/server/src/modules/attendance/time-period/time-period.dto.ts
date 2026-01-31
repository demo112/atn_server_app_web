import { IsString, IsInt, IsOptional, Matches, IsObject, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTimePeriodDto, UpdateTimePeriodDto, TimePeriodRules } from '@attendance/shared';

export class TimePeriodRulesDto implements TimePeriodRules {
  @IsOptional()
  @IsInt()
  minWorkHours?: number;

  @IsOptional()
  @IsInt()
  maxWorkHours?: number;

  @IsOptional()
  @IsInt()
  lateGraceMinutes?: number;

  @IsOptional()
  @IsInt()
  earlyLeaveGraceMinutes?: number;

  @IsOptional()
  @IsInt()
  checkInStartOffset?: number;

  @IsOptional()
  @IsInt()
  checkInEndOffset?: number;

  @IsOptional()
  @IsInt()
  checkOutStartOffset?: number;

  @IsOptional()
  @IsInt()
  checkOutEndOffset?: number;

  @IsOptional()
  @IsInt()
  absentTime?: number;
}

export class CreateTimePeriodReqDto implements CreateTimePeriodDto {
  @IsString()
  name: string;

  @IsInt()
  @IsIn([0, 1])
  type: number;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  endTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  restStartTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  restEndTime?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TimePeriodRulesDto)
  rules?: TimePeriodRulesDto;
}

export class UpdateTimePeriodReqDto implements UpdateTimePeriodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  type?: number;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  endTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  restStartTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '时间格式必须为 HH:mm' })
  restEndTime?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TimePeriodRulesDto)
  rules?: TimePeriodRulesDto;
}
