
import { Request, Response } from 'express';
import { StatisticsService } from './statistics.service';
import { success } from '../../common/types/response';
import { GetSummaryDto, DailyRecordQuery, AttendanceStatus, GetDeptStatsDto, GetChartStatsDto, ExportStatsDto } from '@attendance/shared';
import { AppError } from '../../common/errors';
import { attendanceScheduler } from '../attendance/attendance-scheduler';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService();
  }

  getDailyRecords = async (req: Request, res: Response) => {
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
  };

  getCalendar = async (req: Request, res: Response) => {
    const { year, month, employeeId } = req.query;
    const user = (req as any).user;

    if (!year || !month) {
      throw new AppError('ERR_INVALID_PARAMS', 'Year and month are required', 400);
    }

    let targetEmployeeId = employeeId ? Number(employeeId) : user.id;

    // 权限控制：普通用户只能查自己
    if (user.role !== 'admin' && targetEmployeeId !== user.id) {
      targetEmployeeId = user.id;
    }

    const data = await this.service.getCalendar(Number(year), Number(month), targetEmployeeId);
    res.json(success(data));
  };

  getDepartmentSummary = async (req: Request, res: Response) => {
    const { startDate, endDate, deptId, employeeId } = req.query as unknown as GetSummaryDto;

    if (!startDate || !endDate) {
      throw new AppError('ERR_INVALID_PARAMS', 'Start date and end date are required', 400);
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
  };

  getDeptStats = async (req: Request, res: Response) => {
    const { month, deptId } = req.query as unknown as GetDeptStatsDto;
    
    if (!month) {
      throw new AppError('ERR_INVALID_PARAMS', 'Month is required (YYYY-MM)', 400);
    }

    const dto: GetDeptStatsDto = {
      month: month as string,
      deptId: deptId ? Number(deptId) : undefined,
    };

    const data = await this.service.getDeptStats(dto);
    res.json(success(data));
  };

  getChartStats = async (req: Request, res: Response) => {
    const { startDate, endDate, deptId } = req.query as unknown as GetChartStatsDto;

    if (!startDate || !endDate) {
      throw new AppError('ERR_INVALID_PARAMS', 'Start date and end date are required', 400);
    }

    const dto: GetChartStatsDto = {
      startDate: startDate as string,
      endDate: endDate as string,
      deptId: deptId ? Number(deptId) : undefined,
    };

    const data = await this.service.getChartStats(dto);
    res.json(success(data));
  };

  exportStats = async (req: Request, res: Response) => {
    const { month, deptId } = req.query as unknown as ExportStatsDto;

    if (!month) {
      throw new AppError('ERR_INVALID_PARAMS', 'Month is required (YYYY-MM)', 400);
    }

    const dto: ExportStatsDto = {
      month: month as string,
      deptId: deptId ? Number(deptId) : undefined,
    };

    const buffer = await this.service.exportStats(dto);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-stats-${month}.xlsx`);
    res.send(buffer);
  };

  triggerCalculation = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      throw new AppError('ERR_FORBIDDEN', 'Only admin can trigger calculation', 403);
    }

    const { startDate, endDate, employeeIds } = req.body;
    
    if (!startDate || !endDate) {
      throw new AppError('ERR_INVALID_PARAMS', 'Start date and end date are required', 400);
    }

    await attendanceScheduler.triggerCalculation({
      startDate,
      endDate,
      employeeIds
    });

    res.json(success({ message: 'Calculation triggered successfully' }));
  };
}
