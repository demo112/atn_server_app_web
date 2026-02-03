import fc from 'fast-check';
import { LoginDtoSchema, LoginVoSchema, MeVoSchema } from '../auth';

describe('Auth Schemas Property Tests', () => {
  test('LoginDtoSchema should validate correct structures', () => {
    const loginDtoArb = fc.record({
      username: fc.string({ minLength: 1 }),
      password: fc.string({ minLength: 1 }),
    });

    fc.assert(
      fc.property(loginDtoArb, (dto) => {
        const result = LoginDtoSchema.safeParse(dto);
        expect(result.success).toBe(true);
      })
    );
  });

  test('LoginVoSchema should validate correct structures', () => {
    const loginVoArb = fc.record({
      token: fc.string(),
      user: fc.record({
        id: fc.integer(),
        username: fc.string(),
        role: fc.constantFrom('admin', 'user'),
        name: fc.oneof(fc.string(), fc.constant(undefined)),
        employeeId: fc.oneof(fc.integer(), fc.constant(undefined)),
        permissions: fc.oneof(fc.array(fc.string()), fc.constant(undefined)),
      })
    });

    fc.assert(
      fc.property(loginVoArb, (vo) => {
        const result = LoginVoSchema.safeParse(vo);
        expect(result.success).toBe(true);
      })
    );
  });

  test('MeVoSchema should validate correct structures', () => {
    const meVoArb = fc.record({
      id: fc.integer(),
      username: fc.string(),
      role: fc.constantFrom('admin', 'user'),
      employeeId: fc.oneof(fc.integer(), fc.constant(undefined)),
      permissions: fc.array(fc.string()),
    });

    fc.assert(
      fc.property(meVoArb, (vo) => {
        const result = MeVoSchema.safeParse(vo);
        expect(result.success).toBe(true);
      })
    );
  });
});
