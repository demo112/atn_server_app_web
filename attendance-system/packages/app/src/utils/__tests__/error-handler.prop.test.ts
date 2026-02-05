import fc from 'fast-check';
import { analyzeErrorResponse } from '../error-handler';

describe('Error Handler Properties', () => {
  test('Status 401 should always trigger CLEAR_AUTH_AND_ALERT', () => {
    fc.assert(
      fc.property(fc.object(), (data) => {
        const action = analyzeErrorResponse(401, data);
        expect(action.type).toBe('CLEAR_AUTH_AND_ALERT');
        expect((action as any).title).toBe('会话已过期');
      })
    );
  });

  test('Status 403 should always trigger ALERT with Permission Denied', () => {
    fc.assert(
      fc.property(fc.object(), (data) => {
        const action = analyzeErrorResponse(403, data);
        expect(action.type).toBe('ALERT');
        expect((action as any).title).toBe('无权限');
      })
    );
  });

  test('Status 400, 404, 500 should trigger ALERT', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(400, 404, 500),
        fc.object(),
        (status, data) => {
          const action = analyzeErrorResponse(status, data);
          expect(action.type).toBe('ALERT');
        }
      )
    );
  });

  test('Unknown status should trigger generic ALERT', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 599 }).filter(s => ![400, 401, 403, 404, 500].includes(s)),
        fc.object(),
        (status, data) => {
          const action = analyzeErrorResponse(status, data);
          expect(action.type).toBe('ALERT');
        }
      )
    );
  });

  test('Message extraction priority', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (msg1, msg2) => {
          // Case 1: data.message exists
          const action1 = analyzeErrorResponse(400, { message: msg1, error: { message: msg2 } });
          const expected1 = msg1 || (msg2 || '请求失败');
          expect((action1 as any).message).toBe(expected1);

          // Case 2: data.message missing, data.error.message exists
          const action2 = analyzeErrorResponse(400, { error: { message: msg2 } });
          const expected2 = msg2 || '请求失败';
          expect((action2 as any).message).toBe(expected2);

          // Case 3: Both missing
          const action3 = analyzeErrorResponse(400, {});
          expect((action3 as any).message).toBe('请求失败');
        }
      )
    );
  });
});
