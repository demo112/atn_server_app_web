
import { departmentService } from './department.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';

describe('DepartmentService - Circular Reference Repro', () => {
  beforeAll(async () => {
    // 清理数据
    await prisma.department.deleteMany();
  });

  afterAll(async () => {
    await prisma.department.deleteMany();
    await prisma.$disconnect();
  });

  it('should NOT crash when fetching tree with circular reference', async () => {
    // 1. 创建部门 A
    const deptA = await prisma.department.create({
      data: {
        name: 'Dept A',
        sortOrder: 1,
      },
    });

    // 2. 创建部门 B，parent 是 A
    const deptB = await prisma.department.create({
      data: {
        name: 'Dept B',
        parentId: deptA.id,
        sortOrder: 2,
      },
    });

    // 3. 修改部门 A，parent 是 B (手动修改数据库制造环)
    await prisma.department.update({
      where: { id: deptA.id },
      data: { parentId: deptB.id },
    });

    // 4. 尝试获取树
    const tree = await departmentService.getTree();
    
    // 应该成功返回
    expect(tree).toBeDefined();
    
    // 验证是否安全处理了循环引用（都变成了根节点，或者至少断开了环）
    // JSON 序列化不应该报错
    const json = JSON.stringify(tree);
    expect(json).toBeDefined();

    // 验证逻辑：因为 A->B->A，处理 B 时发现 B->A->B 循环，B 变成 root。
    // 处理 A 时... A 在 B 前面吗？orderBy sortOrder asc.
    // A (sortOrder 1), B (sortOrder 2).
    // 1. Process A: parentId=B. B has parentId=A. 
    //    map.get(B) exists. 
    //    Check cycle: B -> A -> B. Cycle detected! A becomes root.
    // 2. Process B: parentId=A. A has parentId=B.
    //    Check cycle: A -> B -> A. Cycle detected! B becomes root.
    // 实际上，map 是预先初始化的。
    // 如果 A 变为了 root，它的 children 是空的。
    // B 加到 A 的 children 里了吗？
    // 当处理 B 时，parentId=A。A 的 parentId=B。
    // 这里的 cycle check 是基于 map 里的 parentId 链接。
    // 只要 parentId 链上有自己，就是 cycle。
    // 所以 A 和 B 都会检测到 cycle，都会变成 root。
    
    expect(tree.length).toBeGreaterThanOrEqual(2);
    const names = tree.map(d => d.name);
    expect(names).toContain('Dept A');
    expect(names).toContain('Dept B');
  });
});
