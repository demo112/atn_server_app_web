import fc from 'fast-check';
import { getErrorMessage } from '../error';

describe('Error Utils Property Tests', () => {
  test('getErrorMessage should always return a string', () => {
    // Arbitrary for Error objects
    const errorInstanceArb = fc.string().map(msg => new Error(msg));
    
    // Arbitrary for Axios-like response errors
    const axiosErrorArb = fc.record({
      response: fc.record({
        data: fc.oneof(
          fc.record({ error: fc.record({ message: fc.string() }) }),
          fc.record({ message: fc.string() }),
          fc.record({ other: fc.string() }) // No message
        )
      })
    });

    // Arbitrary for unknown types
    const unknownArb = fc.oneof(
      fc.string(),
      fc.integer(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.object()
    );

    const anyErrorArb = fc.oneof(
      errorInstanceArb,
      axiosErrorArb,
      unknownArb
    );

    fc.assert(
      fc.property(anyErrorArb, (error) => {
        const msg = getErrorMessage(error);
        expect(typeof msg).toBe('string');
      })
    );
  });
});
