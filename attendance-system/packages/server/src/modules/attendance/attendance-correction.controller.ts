import { Request, Response } from 'express';
import { AttendanceCorrectionService } from './attendance-correction.service';
import { 
  SupplementCheckInDto, 
  SupplementCheckOutDto, 
  QueryDailyRecordsDto,
  QueryCorrectionsDto,
  UpdateCorrectionDto
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
    logger.info({ body: req.body, user: (req as any).user?.id }, 'Received check-in request');
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
      logger.error({ err: error, body: req.body }, 'CheckIn correction failed');
      
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
      logger.error({ err: error, body: req.body }, 'CheckOut correction failed');
      
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
   * 查询补签记录列表
   */
  async getCorrections(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const query: QueryCorrectionsDto = req.query as any;

      // 权限控制
      if (user.role !== 'admin') {
        if (!user.employeeId) {
          throw new AppError('ERR_AUTH_NO_EMPLOYEE', 'No employee linked', 403);
        }
        query.deptId = undefined; 
        query.employeeId = user.employeeId;
      }

      const result = await service.getCorrections(query);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ err: error, query: req.query }, 'Get corrections failed');
      
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
   * 修改补签记录
   */
  async updateCorrection(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdateCorrectionDto = req.body;
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'ERR_UNAUTHORIZED', message: 'User not logged in' }
        });
      }

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid correction ID' }
        });
      }

      const result = await service.updateCorrection(id, dto, user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ err: error, body: req.body, params: req.params }, 'Update correction failed');
      
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
   * 删除补签记录
   */
  async deleteCorrection(req: Request, res: Response) {
    logger.info({ params: req.params, user: (req as any).user?.id }, 'Received delete correction request');
    try {
      const id = parseInt(req.params.id);
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'ERR_UNAUTHORIZED', message: 'User not logged in' }
        });
      }

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid correction ID' }
        });
      }

      await service.deleteCorrection(id);
      
      res.json({
        success: true,
        data: null
      });
    } catch (error: any) {
      logger.error({ err: error, params: req.params }, 'Delete correction failed');
      
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
      const user = (req as any).user;
      const query: QueryDailyRecordsDto = req.query as any;
      // 注意: query params 都是 string，需要转换 (Service层处理了大部分，但 status 可能需要注意)

      // 权限控制
      if (user.role !== 'admin') {
        if (!user.employeeId) {
          throw new AppError('ERR_AUTH_NO_EMPLOYEE', 'No employee linked', 403);
        }
        query.deptId = undefined;
        query.employeeId = user.employeeId;
      }
      
      const result = await service.getDailyRecords(query);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ err: error, query: req.query }, 'Get daily records failed');
      
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
