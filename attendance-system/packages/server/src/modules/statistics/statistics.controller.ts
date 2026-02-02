
import { Request, Response, NextFunction } from 'express';
import { StatisticsService } from './statistics.service';
import { success } from '../../common/types/response';
import { GetSummaryDto } from '@attendance/shared';
import { AppError } from '../../common/errors';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService();
  }

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
}
