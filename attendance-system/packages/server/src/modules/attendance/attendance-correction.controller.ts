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
import { success } from '../../common/types/response';

const service = new AttendanceCorrectionService();
const logger = createLogger('AttendanceCorrectionController');

export class AttendanceCorrectionController {
  
  /**
   * 补签到
   */
  async checkIn(req: Request, res: Response) {
    logger.info({ body: req.body, user: (req as any).user?.id }, 'Received check-in request');
    const dto: SupplementCheckInDto = req.body;
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('ERR_UNAUTHORIZED', 'User not logged in', 401);
    }

    const result = await service.checkIn(dto, user.id);
    
    res.json(success(result));
  }

  /**
   * 补签退
   */
  async checkOut(req: Request, res: Response) {
    const dto: SupplementCheckOutDto = req.body;
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('ERR_UNAUTHORIZED', 'User not logged in', 401);
    }

    const result = await service.checkOut(dto, user.id);
    
    res.json(success(result));
  }

  /**
   * 查询补签记录列表
   */
  async getCorrections(req: Request, res: Response) {
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
    
    res.json(success(result));
  }

  /**
   * 修改补签记录
   */
  async updateCorrection(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const dto: UpdateCorrectionDto = req.body;
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('ERR_UNAUTHORIZED', 'User not logged in', 401);
    }

    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid correction ID', 400);
    }

    const result = await service.updateCorrection(id, dto, user.id);
    
    res.json(success(result));
  }

  /**
   * 删除补签记录
   */
  async deleteCorrection(req: Request, res: Response) {
    logger.info({ params: req.params, user: (req as any).user?.id }, 'Received delete correction request');
    const id = parseInt(req.params.id);
    const user = (req as any).user;
    
    if (!user) {
      throw new AppError('ERR_UNAUTHORIZED', 'User not logged in', 401);
    }

    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid correction ID', 400);
    }

    await service.deleteCorrection(id);
    
    res.json(success(null));
  }

  /**
   * 查询每日考勤记录 (含异常状态筛选)
   */
  async getDailyRecords(req: Request, res: Response) {
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
    
    try {
      const result = await service.getDailyRecords(query);
      res.json(success(result));
    } catch (error) {
      logger.error({ error, query, user: user.id }, 'getDailyRecords failed');
      throw error;
    }
  }
}
