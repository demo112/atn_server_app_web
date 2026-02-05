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
    ERR_INVALID_PARAM: '参数错误',
    ERR_INVALID_PARAMS: '参数错误',
    ERR_UNAUTHORIZED: '未认证',
    ERR_FORBIDDEN: '无权限',
    ERR_NOT_FOUND: '资源不存在',
    ERR_INTERNAL: '服务器内部错误',
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
  const phraseMap: Array<{ test: (msg: string) => boolean; zh: string }> = [
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
    { test: (m) => m.includes('Token expired or invalid'), zh: '认证信息已过期或无效' },
    { test: (m) => m.includes('Invalid token format'), zh: '认证信息格式错误' },
    { test: (m) => m.includes('No token provided'), zh: '缺少认证信息' },
    { test: (m) => m.includes('Username already exists'), zh: '用户名已存在' },
    { test: (m) => m.includes('Employee is already linked to a user'), zh: '该员工已关联用户' }
  ];
  let errorMessage = rawMessage;
  const matched = typeof rawMessage === 'string' ? phraseMap.find(p => p.test(rawMessage)) : undefined;
  if (!rawMessage || rawMessage === '请求失败') {
    if (code && translations[code]) {
      errorMessage = translations[code];
    } else if (matched) {
      errorMessage = matched.zh;
    }
  } else if (matched) {
    errorMessage = matched.zh;
  }

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
