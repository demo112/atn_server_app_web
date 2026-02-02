
import { Request, Response } from 'express';
import { TimePeriodService } from './time-period.service';
import { CreateTimePeriodDto, UpdateTimePeriodDto } from './time-period.dto';
import { logger } from '../../../../common/logger';

export class TimePeriodController {
  private timePeriodService: TimePeriodService;

  constructor() {
    this.timePeriodService = new TimePeriodService();
  }

  async create(req: Request, res: Response) {
    try {
      const dto = req.body as CreateTimePeriodDto;
      const result = await this.timePeriodService.create(dto);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Create failed', { error, body: req.body });
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
      const id = req.params.id;
      const dto = req.body as UpdateTimePeriodDto;
      const result = await this.timePeriodService.update(id, dto);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[TimePeriod] Update failed', { error, id: req.params.id, body: req.body });
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
