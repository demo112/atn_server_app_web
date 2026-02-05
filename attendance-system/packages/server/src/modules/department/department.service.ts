
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { createLogger } from '../../common/logger';
import { 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  DepartmentVO 
} from '@attendance/shared';

const logger = createLogger('department-service');

export class DepartmentService {
  /**
   * 获取完整部门树
   */
  async getTree(): Promise<DepartmentVO[]> {
    const departments = await prisma.department.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // 转换类型并建立映射
    const map = new Map<number, DepartmentVO>();
    const roots: DepartmentVO[] = [];

    // 1. 初始化所有节点
    departments.forEach(dept => {
      map.set(dept.id, {
        id: dept.id,
        name: dept.name,
        parentId: dept.parentId,
        sortOrder: dept.sortOrder,
        createdAt: dept.createdAt.toISOString(),
        updatedAt: dept.updatedAt.toISOString(),
        children: [],
      });
    });

    // 2. 组装树
    departments.forEach(dept => {
      const node = map.get(dept.id)!;
      if (dept.parentId && map.has(dept.parentId)) {
        const parent = map.get(dept.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * 创建部门
   */
  async create(data: CreateDepartmentDto): Promise<DepartmentVO> {
    const { name, parentId, sortOrder } = data;

    if (!name || name.trim() === '') {
      throw AppError.badRequest('Department name cannot be empty', 'ERR_DEPT_NAME_EMPTY');
    }

    // 校验父节点是否存在
    if (parentId) {
      const parent = await prisma.department.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw AppError.notFound('Parent Department');
      }
    }

    // 检查同名（可选，同一父节点下不重名）
    const exists = await prisma.department.findFirst({
      where: { 
        name, 
        parentId: parentId || null 
      }
    });
    
    if (exists) {
      throw AppError.conflict('Department name already exists in this level', 'ERR_DEPT_NAME_EXISTS');
    }

    const dept = await prisma.department.create({
      data: {
        name,
        parentId,
        sortOrder: sortOrder || 0,
      },
    });

    logger.info({ departmentId: dept.id }, 'Department created');

    return {
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId,
      sortOrder: dept.sortOrder,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
      children: [],
    };
  }

  /**
   * 更新部门
   */
  async update(id: number, data: UpdateDepartmentDto): Promise<DepartmentVO> {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      throw AppError.notFound('Department');
    }

    // 如果修改了 parentId，需要进行循环引用校验
    if (data.parentId !== undefined && data.parentId !== dept.parentId) {
      if (data.parentId === id) {
        throw AppError.badRequest('Cannot set department as its own parent', 'ERR_DEPT_CYCLE');
      }
      
      if (data.parentId) {
        await this.checkCircularReference(id, data.parentId);
      }
    }

    // 检查重名
    if (data.name && data.name !== dept.name) {
      const parentId = data.parentId !== undefined ? data.parentId : dept.parentId;
      const exists = await prisma.department.findFirst({
        where: { 
          name: data.name, 
          parentId: parentId,
          id: { not: id }
        }
      });
      if (exists) {
        throw AppError.conflict('Department name already exists in this level', 'ERR_DEPT_NAME_EXISTS');
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
      },
    });

    logger.info({ departmentId: id, changes: data }, 'Department updated');

    return {
      id: updated.id,
      name: updated.name,
      parentId: updated.parentId,
      sortOrder: updated.sortOrder,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      children: [], // Update 不返回完整子树，前端通常会重新获取树或只更新当前节点信息
    };
  }

  /**
   * 删除部门
   */
  async delete(id: number): Promise<void> {
    const start = Date.now();
    logger.info({ departmentId: id }, 'Starting department deletion');

    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      throw AppError.notFound('Department');
    }

    // 并行校验子部门和员工
    const [childCount, employeeCount] = await Promise.all([
      prisma.department.count({ where: { parentId: id } }),
      prisma.employee.count({ 
        where: { 
          deptId: id,
          status: { not: 'deleted' }
        } 
      })
    ]);

    logger.info({ 
      departmentId: id, 
      childCount, 
      employeeCount, 
      checkDuration: Date.now() - start 
    }, 'Department deletion checks completed');

    if (childCount > 0) {
      throw AppError.badRequest('Cannot delete department with sub-departments', 'ERR_DEPT_HAS_CHILDREN');
    }

    if (employeeCount > 0) {
      throw AppError.badRequest('Cannot delete department with employees', 'ERR_DEPT_HAS_EMPLOYEES');
    }

    const deleteStart = Date.now();
    await prisma.department.delete({ where: { id } });
    
    logger.info({ 
      departmentId: id, 
      totalDuration: Date.now() - start,
      deleteDuration: Date.now() - deleteStart
    }, 'Department deleted successfully');
  }

  /**
   * 检查循环引用
   * 逻辑：从 newParentId 向上遍历，如果路径中包含 targetId，则构成了循环
   */
  private async checkCircularReference(targetId: number, newParentId: number): Promise<void> {
    let currentId: number | null = newParentId;
    
    // 防止死循环，设置最大深度（虽然理论上数据库里不应该有环，但为了安全）
    let depth = 0;
    const MAX_DEPTH = 20;

    while (currentId !== null && depth < MAX_DEPTH) {
      if (currentId === targetId) {
        throw AppError.badRequest('Circular reference detected', 'ERR_DEPT_CYCLE');
      }

      const parent: { parentId: number | null } | null = await prisma.department.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      });

      if (!parent) {
        // Parent 不存在（可能数据不一致），停止检查
        break;
      }

      currentId = parent.parentId;
      depth++;
    }
  }

  async getById(id: number): Promise<DepartmentVO> {
    logger.info({ id }, 'Fetching department details');
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      throw AppError.notFound('Department');
    }
    return {
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId,
      sortOrder: dept.sortOrder,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
      children: [],
    };
  }
}

export const departmentService = new DepartmentService();
