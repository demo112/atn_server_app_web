export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = (error as any).response;
    const code: string | undefined = resp?.data?.error?.code;
    const msg: string | undefined = resp?.data?.error?.message || resp?.data?.message;
    const translations: Record<string, string> = {
      ERR_CLOCK_TOO_FREQUENT: '打卡过于频繁，请稍后再试',
      ERR_CLOCK_FUTURE_TIME_NOT_ALLOWED: '不允许未来时间打卡',
      ERR_EMPLOYEE_NOT_FOUND: '员工不存在',
      ERR_VALIDATION: '参数验证失败',
      ERR_VALIDATION_FAILED: '参数验证失败',
      ERR_INTERNAL: '服务器内部错误'
    };
    if (code && translations[code]) {
      return translations[code];
    }
    if (msg === 'Clock in too frequent') {
      return '打卡过于频繁，请稍后再试';
    }
    if (msg) {
      return msg || '未知错误';
    }
  }
  if (error instanceof Error) {
    return error.message || '未知错误';
  }
  return '未知错误';
};
