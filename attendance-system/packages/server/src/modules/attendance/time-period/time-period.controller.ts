
import { Request, Response } from 'express';
import { TimePeriodService } from './time-period.service';
import { CreateTimePeriodReqDto, UpdateTimePeriodReqDto } from './time-period.dto';
import { logger } from '../../../common/logger';
import { AppError } from '../../../common/errors';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export class TimePeriodController {
  private timePeriodService: TimePeriodService;

  constructor() {
    this.timePeriodService = new TimePeriodService();
  }

  async create(req: Request, res: Response) {
    const dto = plainToInstance(CreateTimePeriodReqDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const details = errors.map(e => Object.values(e.constraints || {})).flat().join(', ');
      throw new AppError('ERR_VALIDATION_FAILED', `Validation failed: ${details}`, 400);
    }

    const result = await this.timePeriodService.create(dto);
    res.status(201).json({
      success: true,
      data: result,
    });
  }

  async findAll(req: Request, res: Response) {
    const result = await this.timePeriodService.findAll();
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async findOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    const result = await this.timePeriodService.findOne(id);
    if (!result) {
      throw new AppError('ERR_TIME_PERIOD_NOT_FOUND', 'Time period not found', 404);
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const dto = plainToInstance(UpdateTimePeriodReqDto, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const details = errors.map(e => Object.values(e.constraints || {})).flat().join(', ');
      throw new AppError('ERR_VALIDATION_FAILED', `Validation failed: ${details}`, 400);
    }

    const result = await this.timePeriodService.update(id, dto);
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await this.timePeriodService.remove(id);
    res.status(200).json({
      success: true,
      data: { id },
    });
  }
}
