import { Request, Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { 
  createEmployeeSchema, 
  updateEmployeeSchema, 
  getEmployeesSchema,
  bindUserSchema
} from './employee.dto';
import { AppError } from '../../common/errors';

export class EmployeeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createEmployeeSchema.parse(req.body);
      const employee = await employeeService.create(dto);
      res.status(201).json({ success: true, data: employee });
    } catch (error) {
      // Zod error handling usually needs mapping, but assuming errorHandler handles it or AppError wraps it
      // If error is ZodError, errorHandler might need to handle it.
      // For now pass to global error handler.
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getEmployeesSchema.parse(req.query);
      const result = await employeeService.findAll(query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw AppError.badRequest('Invalid ID');
      const employee = await employeeService.findOne(id);
      res.json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw AppError.badRequest('Invalid ID');
      const dto = updateEmployeeSchema.parse(req.body);
      const employee = await employeeService.update(id, dto);
      res.json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw AppError.badRequest('Invalid ID');
      await employeeService.delete(id);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }

  async bindUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw AppError.badRequest('Invalid ID');
      const dto = bindUserSchema.parse(req.body);
      await employeeService.bindUser(id, dto);
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
