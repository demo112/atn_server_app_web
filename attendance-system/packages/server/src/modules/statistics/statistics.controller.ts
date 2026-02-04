
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
    const { 
      type = 'summary', 
      month, 
      deptId, 
      employeeName, 
      deptName,
      startDate: qStartDate,
      endDate: qEndDate,
    } = req.query as any;

    let buffer: Buffer;
    let filename: string;

    if (type === 'daily') {
      // 每日明细导出
      if (!qStartDate || !qEndDate) {
        throw new AppError('ERR_INVALID_PARAMS', 'StartDate and EndDate are required for daily export', 400);
      }
      
      buffer = await this.service.exportDailyRecords({
        startDate: qStartDate,
        endDate: qEndDate,
        deptId: deptId ? Number(deptId) : undefined,
        employeeName,
        deptName,
        page: 1,
        pageSize: 100000
      });
      filename = `attendance-daily-${qStartDate}-${qEndDate}.xlsx`;
    } else {
      // 月度汇总导出 (default)
      if (!month) {
        throw new AppError('ERR_INVALID_PARAMS', 'Month is required (YYYY-MM)', 400);
      }

      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new AppError('ERR_INVALID_PARAMS', 'Month must be in YYYY-MM format', 400);
      }

      // Convert month to startDate and endDate
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      const end = new Date(year, monthNum, 0); // Last day of month
      
      const startDate = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
      const endDate = `${yearStr}-${monthStr.padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const dto: GetSummaryDto = {
        startDate,
        endDate,
        deptId: deptId ? Number(deptId) : undefined,
        employeeName,
        deptName,
      };

      // Use exportDepartmentSummary to export detailed employee records match the UI
      buffer = await this.service.exportDepartmentSummary(dto);
      filename = `attendance-summary-${month}.xlsx`;
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
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
