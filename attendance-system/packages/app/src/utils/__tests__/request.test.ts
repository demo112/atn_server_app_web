import axios, { AxiosError } from 'axios';
import { Alert } from 'react-native';
import { getToken, clearAuth } from '../auth';
import { z } from 'zod';
import { logger } from '../logger';

// Mock dependencies
jest.mock('../auth', () => ({
  getToken: jest.fn(),
  clearAuth: jest.fn(),
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');

// Mock axios with factory to ensure create returns proper object with interceptors
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    })),
    isAxiosError: jest.fn((payload) => payload?.isAxiosError === true),
  };
});

// Import module under test AFTER mocks are set up
import request, { validateResponse } from '../request';

describe('request utils', () => {
  let requestHandlers: { success: any, error: any };
  let responseHandlers: { success: any, error: any };

  beforeAll(() => {
    const reqUse = request.interceptors.request.use as jest.Mock;
    const resUse = request.interceptors.response.use as jest.Mock;
    
    // Check if mocks were called. If not, something is wrong with setup.
    if (reqUse.mock.calls.length === 0 || resUse.mock.calls.length === 0) {
      console.error('Interceptors were not registered!');
    }

    requestHandlers = {
      success: reqUse.mock.calls[0][0],
      error: reqUse.mock.calls[0][1]
    };
    
    responseHandlers = {
      success: resUse.mock.calls[0][0],
      error: resUse.mock.calls[0][1]
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should attach token to headers if exists', async () => {
      const requestHandler = requestHandlers.success;

      (getToken as jest.Mock).mockResolvedValue('fake-token');
      
      const config = { headers: {} };
      const result = await requestHandler(config);
      
      expect(result.headers).toEqual({ Authorization: 'Bearer fake-token' });
    });

    it('should not attach token if not exists', async () => {
      const requestHandler = requestHandlers.success;

      (getToken as jest.Mock).mockResolvedValue(null);
      
      const config = { headers: {} };
      const result = await requestHandler(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle request error', async () => {
        const errorHandler = requestHandlers.error;
        
        const error = new Error('test');
        await expect(errorHandler(error)).rejects.toThrow('test');
    });
  });

  describe('Response Interceptor', () => {
    it('should return data on success', () => {
      const successHandler = responseHandlers.success;
      const response = { data: { success: true, data: 'test' } };
      expect(successHandler(response)).toEqual({ success: true, data: 'test' });
    });

    it('should handle 400 error', async () => {
      const errorHandler = responseHandlers.error;
      const error = {
        response: { status: 400, data: { message: 'Bad Request' } },
        isAxiosError: true
      };
      
      try {
        await errorHandler(error);
      } catch (e) {
        expect(Alert.alert).toHaveBeenCalledWith('错误', 'Bad Request');
      }
    });

    it('should handle 401 error (Session Expired)', async () => {
      const errorHandler = responseHandlers.error;
      const error = {
        response: { status: 401, data: { message: 'Unauthorized' } },
        isAxiosError: true
      };
      
      try {
        await errorHandler(error);
      } catch (e) {
        expect(Alert.alert).toHaveBeenCalledWith('会话已过期', '请重新登录');
        expect(clearAuth).toHaveBeenCalled();
      }
    });

    it('should handle 403 error (Permission Denied)', async () => {
      const errorHandler = responseHandlers.error;
      const error = {
        response: { status: 403, data: { message: 'Forbidden' } },
        isAxiosError: true
      };
      
      try {
        await errorHandler(error);
      } catch (e) {
        expect(Alert.alert).toHaveBeenCalledWith('无权限', '你没有执行此操作的权限');
      }
    });

    it('should handle 404 error (Resource Not Found)', async () => {
      const errorHandler = responseHandlers.error;
      const error = {
        response: { status: 404, data: { message: 'Not Found' } },
        isAxiosError: true
      };
      
      try {
        await errorHandler(error);
      } catch (e) {
        expect(Alert.alert).toHaveBeenCalledWith('错误', '资源不存在');
      }
    });

    it('should handle 500 error (Server Error)', async () => {
      const errorHandler = responseHandlers.error;
      const error = {
        response: { status: 500, data: { message: 'Internal Error' } },
        isAxiosError: true
      };
      
      try {
        await errorHandler(error);
      } catch (e) {
        expect(Alert.alert).toHaveBeenCalledWith('服务器错误', '请稍后再试');
      }
    });

    it('should handle other errors', async () => {
      const errorHandler = responseHandlers.error;
      const error = {
        response: { status: 418, data: { message: 'I am a teapot' } },
        isAxiosError: true
      };
      
      try {
        await errorHandler(error);
      } catch (e) {
        expect(Alert.alert).toHaveBeenCalledWith('错误', 'I am a teapot');
      }
    });

    it('should handle network error', async () => {
        const errorHandler = responseHandlers.error;
        const error = {
          request: {}, // Indicates network error (no response)
          isAxiosError: true
        };
        
        try {
          await errorHandler(error);
        } catch (e) {
          expect(Alert.alert).toHaveBeenCalledWith('网络错误', '请检查网络连接');
        }
      });

    it('should handle request configuration error', async () => {
        const errorHandler = responseHandlers.error;
        const error = {
          isAxiosError: true
        };
        
        try {
          await errorHandler(error);
        } catch (e) {
          expect(Alert.alert).toHaveBeenCalledWith('错误', '请求配置错误');
        }
      });
  });

  describe('validateResponse', () => {
    const mockSchema = z.object({
      id: z.number(),
      name: z.string()
    });

    it('should return data when validation succeeds', async () => {
      const mockPromise = Promise.resolve({
        success: true,
        data: { id: 1, name: 'Test' }
      });

      const result = await validateResponse(mockPromise, mockSchema);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should throw error when API returns success: false', async () => {
      const mockPromise = Promise.resolve({
        success: false,
        error: { code: 'ERR', message: 'API Error' }
      });

      await expect(validateResponse(mockPromise, mockSchema))
        .rejects.toThrow('API Error');
    });

    it('should throw error when validation fails', async () => {
      const mockPromise = Promise.resolve({
        success: true,
        data: { id: 'invalid', name: 'Test' } // id should be number
      });

      await expect(validateResponse(mockPromise, mockSchema))
        .rejects.toThrow('Response validation failed');
      expect(logger.error).toHaveBeenCalled();
    });
    
    it('should handle void schema', async () => {
        const voidSchema = z.void();
        const mockPromise = Promise.resolve({
            success: true,
            data: null
        });
        
        const result = await validateResponse(mockPromise, voidSchema);
        expect(result).toBeUndefined();
    });
  });
});
