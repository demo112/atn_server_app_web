import fc from 'fast-check';
import { validateResponse } from '../request';
import { z } from 'zod';
import { logger } from '../logger';

// Mock logger to avoid cluttering test output
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Request Utils Properties', () => {
  const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
  });

  test('validateResponse should return data when response is successful and matches schema', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer(),
        fc.string(),
        async (id, name) => {
          const validData = { id, name };
          const response = { success: true, data: validData };
          const promise = Promise.resolve(response);

          const result = await validateResponse(promise, UserSchema);
          expect(result).toEqual(validData);
        }
      )
    );
  });

  test('validateResponse should throw Error when response.success is false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        async (errorMessage) => {
          const response = { success: false, error: { message: errorMessage } };
          const promise = Promise.resolve(response);

          await expect(validateResponse(promise, UserSchema)).rejects.toThrow(errorMessage);
        }
      )
    );
  });

  test('validateResponse should throw Error when data does not match schema', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // name provided as id (invalid type)
        fc.string(),
        async (invalidId, name) => {
          const invalidData = { id: invalidId, name }; // id should be number
          const response = { success: true, data: invalidData };
          const promise = Promise.resolve(response);

          await expect(validateResponse(promise, UserSchema)).rejects.toThrow('Response validation failed');
          expect(logger.error).toHaveBeenCalled();
        }
      )
    );
  });

  test('validateResponse should handle void schema', async () => {
    const response = { success: true, data: null };
    const promise = Promise.resolve(response);
    
    const result = await validateResponse(promise, z.void());
    expect(result).toBeUndefined();
  });
});
