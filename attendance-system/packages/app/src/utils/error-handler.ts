export type ErrorAction = 
  | { type: 'ALERT'; title: string; message: string }
  | { type: 'CLEAR_AUTH_AND_ALERT'; title: string; message: string }
  | { type: 'REJECT'; error: any };

export function analyzeErrorResponse(status: number, data: any): ErrorAction {
  const code = data?.error?.code;
  const rawMessage = data?.message || data?.error?.message || '请求失败';
  const translations: Record<string, string> = {
    ERR_CLOCK_TOO_FREQUENT: '打卡过于频繁，请稍后再试',
    ERR_CLOCK_FUTURE_TIME_NOT_ALLOWED: '不允许未来时间打卡',
    ERR_EMPLOYEE_NOT_FOUND: '员工不存在',
    ERR_VALIDATION: '参数验证失败',
    ERR_VALIDATION_FAILED: '参数验证失败',
    ERR_UNAUTHORIZED: '未认证',
    ERR_FORBIDDEN: '无权限',
    ERR_NOT_FOUND: '资源不存在',
    ERR_INTERNAL: '服务器内部错误'
  };
  const errorMessage = code && translations[code] ? translations[code] : rawMessage;

  switch (status) {
    case 400:
      return { type: 'ALERT', title: '错误', message: errorMessage };
    case 401:
      return { type: 'CLEAR_AUTH_AND_ALERT', title: '会话已过期', message: '请重新登录' };
    case 403:
      return { type: 'ALERT', title: '无权限', message: '你没有执行此操作的权限' };
    case 404:
      return { type: 'ALERT', title: '错误', message: '资源不存在' };
    case 500:
      return { type: 'ALERT', title: '服务器错误', message: '请稍后再试' };
    default:
      return { type: 'ALERT', title: '错误', message: errorMessage };
  }
}
