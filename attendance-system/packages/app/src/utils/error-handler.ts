export type ErrorAction = 
  | { type: 'ALERT'; title: string; message: string }
  | { type: 'CLEAR_AUTH_AND_ALERT'; title: string; message: string }
  | { type: 'REJECT'; error: any };

export function analyzeErrorResponse(status: number, data: any): ErrorAction {
  const errorMessage = data?.message || data?.error?.message || 'Request failed';

  switch (status) {
    case 400:
      return { type: 'ALERT', title: 'Error', message: errorMessage };
    case 401:
      return { type: 'CLEAR_AUTH_AND_ALERT', title: 'Session Expired', message: 'Please login again' };
    case 403:
      return { type: 'ALERT', title: 'Permission Denied', message: 'You do not have permission to perform this action' };
    case 404:
      return { type: 'ALERT', title: 'Error', message: 'Resource not found' };
    case 500:
      return { type: 'ALERT', title: 'Server Error', message: 'Please try again later' };
    default:
      return { type: 'ALERT', title: 'Error', message: errorMessage };
  }
}
