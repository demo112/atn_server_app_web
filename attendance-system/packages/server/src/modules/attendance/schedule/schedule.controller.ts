import { Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { CreateScheduleReqDto, BatchCreateScheduleReqDto } from './schedule.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { logger } from '../../../common/logger';
import { AppError } from '../../../common/errors';

const service = new ScheduleService();

export class ScheduleController {
  
  /**
   * 创建排班 (单人)
   */
  async create(req: Request, res: Response) {
    const dto = plainToInstance(CreateScheduleReqDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      const details = errors.map(e => Object.values(e.constraints || {})).flat().join(', ');
      throw new AppError('ERR_VALIDATION_FAILED', `Validation failed: ${details}`, 400);
    }

    const result = await service.create(dto);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  }

  /**
   * 批量排班 (部门)
   */
  async batchCreate(req: Request, res: Response) {
    const dto = plainToInstance(BatchCreateScheduleReqDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      const details = errors.map(e => Object.values(e.constraints || {})).flat().join(', ');
      throw new AppError('ERR_VALIDATION_FAILED', `Validation failed: ${details}`, 400);
    }

    const result = await service.batchCreate(dto);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  }

  /**
   * 查询排班
   */
  async getOverview(req: Request, res: Response) {
    const user = (req as any).user;
    const query = {
      employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
      deptId: req.query.deptId ? Number(req.query.deptId) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    // 权限控制
    if (user.role !== 'admin') {
      if (!user.employeeId) {
        throw new AppError('ERR_AUTH_NO_EMPLOYEE', 'No employee linked', 403);
      }
      query.deptId = undefined;
      query.employeeId = user.employeeId;
    }

    if (!query.startDate || !query.endDate) {
      throw new AppError('ERR_VALIDATION_FAILED', 'startDate and endDate are required', 400);
    }

    const result = await service.getOverview(query);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  }

  /**
   * 删除排班
   */
  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_ID', 'Invalid ID', 400);
    }

    await service.delete(id);
    
    res.status(200).json({
      success: true,
    });
  }
}
