
import { Request, Response, NextFunction } from 'express';
import { StatisticsService } from './statistics.service';
import { success } from '../../common/types/response';
import { GetSummaryDto, DailyRecordQuery, AttendanceStatus } from '@attendance/shared';
import { AppError } from '../../common/errors';
import { attendanceScheduler } from '../attendance/attendance-scheduler';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService();
  }

  getDailyRecords = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        startDate, 
        endDate, 
        deptId, 
        employeeId, 
        employeeName,
        status,
        page = 1, 
        pageSize = 20 
      } = req.query as unknown as DailyRecordQuery;

      const user = (req as any).user;
      
      const query: DailyRecordQuery = {
        startDate,
        endDate,
        deptId: deptId ? Number(deptId) : undefined,
        employeeId: employeeId ? Number(employeeId) : undefined,
        employeeName,
        status: status as AttendanceStatus,
        page: Number(page),
        pageSize: Number(pageSize),
      };

      // 权限控制：普通用户只能查自己
      if (user.role !== 'admin') {
        query.employeeId = user.id;
        query.deptId = undefined; // 普通用户不能查部门
        query.employeeName = undefined; // 普通用户不能搜索他人
      }

      const data = await this.service.getDailyRecords(query);
      res.json(success(data));
    } catch (error) {
      next(error);
    }
  };

  getCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month, employeeId } = req.query;
      const user = (req as any).user;

      if (!year || !month) {
        throw new AppError('ERR_INVALID_PARAMS', 'Year and month are required');
      }

      let targetEmployeeId = employeeId ? Number(employeeId) : user.id;

      // 权限控制：普通用户只能查自己
      if (user.role !== 'admin' && targetEmployeeId !== user.id) {
        targetEmployeeId = user.id;
      }

      const data = await this.service.getCalendar(Number(year), Number(month), targetEmployeeId);
      res.json(success(data));
    } catch (error) {
      next(error);
    }
  };

  getDepartmentSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, deptId, employeeId } = req.query as unknown as GetSummaryDto;

      if (!startDate || !endDate) {
        throw new AppError('ERR_INVALID_PARAMS', 'Start date and end date are required');
      }

      // Convert query params to correct types
      const dto: GetSummaryDto = {
        startDate: startDate as string,
        endDate: endDate as string,
        deptId: deptId ? Number(deptId) : undefined,
        employeeId: employeeId ? Number(employeeId) : undefined,
      };

      const data = await this.service.getDepartmentSummary(dto);
      res.json(success(data));
    } catch (error) {
      next(error);
    }
  };

  triggerCalculation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'admin') {
        throw new AppError('ERR_FORBIDDEN', 'Only admin can trigger calculation');
      }

      const { startDate, endDate, employeeIds } = req.body;
      
      if (!startDate || !endDate) {
        throw new AppError('ERR_INVALID_PARAMS', 'Start date and end date are required');
      }

      // 确保 employeeIds 是数组
      let targetEmployeeIds: number[] = [];
      if (Array.isArray(employeeIds)) {
        targetEmployeeIds = employeeIds.map(Number);
      } else if (employeeIds) {
        targetEmployeeIds = [Number(employeeIds)];
      }

      await attendanceScheduler.triggerCalculation({
        startDate,
        endDate,
        employeeIds: targetEmployeeIds.length > 0 ? targetEmployeeIds : undefined
      });

      res.json(success({ message: 'Calculation triggered successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
