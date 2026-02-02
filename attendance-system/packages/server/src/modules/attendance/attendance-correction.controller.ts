import { Request, Response } from 'express';
import { AttendanceCorrectionService } from './attendance-correction.service';
import { 
  SupplementCheckInDto, 
  SupplementCheckOutDto, 
  QueryDailyRecordsDto 
} from '@attendance/shared/src/types/attendance/correction';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';

const service = new AttendanceCorrectionService();
const logger = createLogger('AttendanceCorrectionController');

export class AttendanceCorrectionController {
  
  /**
   * 补签到
   */
  async checkIn(req: Request, res: Response) {
    try {
      const dto: SupplementCheckInDto = req.body;
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'ERR_UNAUTHORIZED', message: 'User not logged in' }
        });
      }

      const result = await service.checkIn(dto, user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('CheckIn correction failed', { error, body: req.body });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: 'Internal server error' }
      });
    }
  }

  /**
   * 补签退
   */
  async checkOut(req: Request, res: Response) {
    try {
      const dto: SupplementCheckOutDto = req.body;
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'ERR_UNAUTHORIZED', message: 'User not logged in' }
        });
      }

      const result = await service.checkOut(dto, user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ error, body: req.body }, 'CheckOut correction failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: 'Internal server error' }
      });
    }
  }

  /**
   * 查询每日考勤记录 (含异常状态筛选)
   */
  async getDailyRecords(req: Request, res: Response) {
    try {
      const query: QueryDailyRecordsDto = req.query as any;
      // 注意: query params 都是 string，需要转换 (Service层处理了大部分，但 status 可能需要注意)
      
      const result = await service.getDailyRecords(query);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ error, query: req.query }, 'Get daily records failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: 'Internal server error' }
      });
    }
  }
}
