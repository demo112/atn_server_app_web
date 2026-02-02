
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
    try {
      const dto = plainToInstance(CreateTimePeriodReqDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_VALIDATION_FAILED',
            message: 'Validation failed',
            details: errors.map(e => Object.values(e.constraints || {})).flat(),
          }
        });
      }

      const result = await this.timePeriodService.create(dto);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Create failed', { error, body: req.body });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: {
          code: 'ERR_TIME_PERIOD_CREATE_FAILED',
          message: error.message,
        },
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const result = await this.timePeriodService.findAll();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Find all failed', { error });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_TIME_PERIOD_FIND_FAILED',
          message: error.message,
        },
      });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await this.timePeriodService.findOne(id);
      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ERR_TIME_PERIOD_NOT_FOUND',
            message: 'Time period not found',
          },
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Find one failed', { error, id: req.params.id });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_TIME_PERIOD_FIND_FAILED',
          message: error.message,
        },
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const dto = plainToInstance(UpdateTimePeriodReqDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_VALIDATION_FAILED',
            message: 'Validation failed',
            details: errors.map(e => Object.values(e.constraints || {})).flat(),
          }
        });
      }

      const result = await this.timePeriodService.update(id, dto);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Update failed', { error, id: req.params.id, body: req.body });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: {
          code: 'ERR_TIME_PERIOD_UPDATE_FAILED',
          message: error.message,
        },
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await this.timePeriodService.remove(id);
      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Remove failed', { error, id: req.params.id });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: {
          code: 'ERR_TIME_PERIOD_DELETE_FAILED',
          message: error.message,
        },
      });
    }
  }
}
