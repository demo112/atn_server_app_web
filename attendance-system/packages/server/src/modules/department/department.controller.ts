
import { Request, Response, NextFunction } from 'express';
import { departmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '@attendance/shared';

export class DepartmentController {
  async getTree(req: Request, res: Response) {
    const tree = await departmentService.getTree();
    res.json({
      success: true,
      data: tree,
    });
  }

  async create(req: Request, res: Response) {
    const dto = req.body as CreateDepartmentDto;
    const department = await departmentService.create(dto);
    res.status(201).json({
      success: true,
      data: department,
    });
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const dto = req.body as UpdateDepartmentDto;
    const department = await departmentService.update(id, dto);
    res.json({
      success: true,
      data: department,
    });
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    await departmentService.delete(id);
    res.json({
      success: true,
      data: null,
    });
  }

  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw AppError.badRequest('Invalid department ID');
    }
    const department = await departmentService.getById(id);
    res.json({
      success: true,
      data: department,
    });
  }
}

export const departmentController = new DepartmentController();
