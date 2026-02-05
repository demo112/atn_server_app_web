import fc from 'fast-check';
import { UserSchema, CreateUserDtoSchema, UserListItemSchema, UserListVoSchema } from '../user';

describe('User Schemas Property Tests', () => {
  const userRoleArb = fc.constantFrom('admin', 'user');
  const userStatusArb = fc.constantFrom('active', 'inactive');

  test('UserSchema should validate correct structures', () => {
    const userArb = fc.record({
      id: fc.integer(),
      username: fc.string(),
      employeeId: fc.oneof(fc.integer(), fc.constant(null), fc.constant(undefined)),
      role: userRoleArb,
      status: userStatusArb,
      createdAt: fc.string(),
      updatedAt: fc.string(),
    });

    fc.assert(
      fc.property(userArb, (user) => {
        const result = UserSchema.safeParse(user);
        expect(result.success).toBe(true);
      })
    );
  });

  test('CreateUserDtoSchema should validate correct structures', () => {
    const createUserArb = fc.record({
      username: fc.string({ minLength: 1 }),
      password: fc.oneof(fc.string({ minLength: 6 }), fc.constant(undefined)),
      role: userRoleArb,
      employeeId: fc.oneof(fc.integer(), fc.constant(undefined)),
    });

    fc.assert(
      fc.property(createUserArb, (dto) => {
        const result = CreateUserDtoSchema.safeParse(dto);
        expect(result.success).toBe(true);
      })
    );
  });

  test('UserListVoSchema should validate correct structures', () => {
    const userListItemArb = fc.record({
      id: fc.integer(),
      username: fc.string(),
      role: userRoleArb,
      status: userStatusArb,
      employeeName: fc.oneof(fc.string(), fc.constant(undefined)),
      createdAt: fc.string(),
    });

    const listVoArb = fc.record({
      items: fc.array(userListItemArb),
      total: fc.integer({ min: 0 }),
    });

    fc.assert(
      fc.property(listVoArb, (list) => {
        const result = UserListVoSchema.safeParse(list);
        expect(result.success).toBe(true);
      })
    );
  });
});
