import fc from 'fast-check';
import { DepartmentVoSchema, CreateDepartmentDtoSchema, UpdateDepartmentDtoSchema } from '../department';

describe('Department Schemas Property Tests', () => {
  // Define leaf node to avoid infinite recursion stack overflow
  const leafDepartment = fc.record({
    id: fc.integer(),
    name: fc.string(),
    parentId: fc.oneof(fc.integer(), fc.constant(null)),
    sortOrder: fc.integer(),
    createdAt: fc.string(),
    updatedAt: fc.string(),
    children: fc.constant(undefined)
  });

  // Define one level of nesting
  const departmentVoArb = fc.record({
    id: fc.integer(),
    name: fc.string(),
    parentId: fc.oneof(fc.integer(), fc.constant(null)),
    sortOrder: fc.integer(),
    createdAt: fc.string(),
    updatedAt: fc.string(),
    children: fc.oneof(fc.array(leafDepartment), fc.constant(undefined))
  });

  test('DepartmentVoSchema should validate correct structures', () => {
    // We restrict the depth to avoid stack overflow in generation
    fc.assert(
      fc.property(departmentVoArb, (dept) => {
        const result = DepartmentVoSchema.safeParse(dept);
        expect(result.success).toBe(true);
      })
    );
  });

  test('CreateDepartmentDtoSchema should validate correct structures', () => {
    const createDtoArb = fc.record({
      name: fc.string({ minLength: 1 }),
      parentId: fc.oneof(fc.integer(), fc.constant(null), fc.constant(undefined)),
      sortOrder: fc.oneof(fc.integer(), fc.constant(undefined)),
    });

    fc.assert(
      fc.property(createDtoArb, (dto) => {
        const result = CreateDepartmentDtoSchema.safeParse(dto);
        expect(result.success).toBe(true);
      })
    );
  });

  test('UpdateDepartmentDtoSchema should validate correct structures', () => {
    const updateDtoArb = fc.record({
      name: fc.oneof(fc.string({ minLength: 1 }), fc.constant(undefined)),
      parentId: fc.oneof(fc.integer(), fc.constant(null), fc.constant(undefined)),
      sortOrder: fc.oneof(fc.integer(), fc.constant(undefined)),
    });

    fc.assert(
      fc.property(updateDtoArb, (dto) => {
        const result = UpdateDepartmentDtoSchema.safeParse(dto);
        expect(result.success).toBe(true);
      })
    );
  });
});
