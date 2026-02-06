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
    ERR_INTERNAL: '服务器内部错误',
    ERR_INVALID_PARAM: '参数错误',
    ERR_INVALID_PARAMS: '参数错误',
    ERR_AUTH_NO_EMPLOYEE: '当前用户未关联员工',
    ERR_AUTH_MISSING_TOKEN: '缺少认证信息',
    ERR_AUTH_INVALID_TOKEN: '认证信息格式错误',
    ERR_AUTH_TOKEN_EXPIRED: '认证信息已过期或无效',
    ERR_ATT_SHIFT_NOT_FOUND: '班次不存在',
    ERR_SHIFT_NOT_FOUND: '班次不存在',
    ERR_UPDATE_FAILED: '更新失败',
    ERR_INVALID_DATE: '日期格式无效',
    ERR_INVALID_DATE_RANGE: '日期范围无效',
    ERR_SCHEDULE_CONFLICT: '存在排班冲突'
    };
    if (code && translations[code]) {
      return translations[code];
    }
  const phraseMap: Array<{ test: (msg: string) => boolean; zh: string }> = [
    { test: (m) => m.includes('Invalid credentials'), zh: '账号或密码错误' },
    { test: (m) => m.includes('Leave time overlaps with existing record'), zh: '请假时间与已有记录重叠' },
    { test: (m) => m.includes('Start time must be before end time'), zh: '开始时间必须早于结束时间' },
    { test: (m) => m.includes('employeeId is required for admin'), zh: '管理员创建请假时必须指定员工（employeeId）' },
    { test: (m) => m.includes('No employee linked'), zh: '当前用户未关联员工' },
    { test: (m) => m.includes('Only admin can update leave records'), zh: '仅管理员可更新请假记录' },
    { test: (m) => m.includes('Only admin can cancel leave records'), zh: '仅管理员可撤销请假记录' },
    { test: (m) => m.includes('Invalid ID'), zh: 'ID 参数无效' },
    { test: (m) => m.includes('Shift not found'), zh: '班次不存在' },
    { test: (m) => m.includes('Invalid cycleDays'), zh: '周期天数参数无效' },
    { test: (m) => m.includes('Invalid date format'), zh: '日期格式无效' },
    { test: (m) => m.includes('Start date must be before end date'), zh: '开始日期必须早于结束日期' },
    { test: (m) => m.includes('Date range cannot exceed'), zh: '日期范围超过限制' },
    { test: (m) => m.includes('Clock in too frequent'), zh: '打卡过于频繁，请稍后再试' },
    { test: (m) => m.includes('Token expired or invalid'), zh: '认证信息已过期或无效' },
    { test: (m) => m.includes('Invalid token format'), zh: '认证信息格式错误' },
    { test: (m) => m.includes('No token provided'), zh: '缺少认证信息' }
  ];
  if (typeof msg === 'string') {
    const matched = phraseMap.find(p => p.test(msg));
    if (matched) return matched.zh;
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
