export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = (error as any).response;
    // NestJS/Express standard error format often is { error: { message: string } } or just { message: string }
    if (resp?.data?.error?.message) {
      return resp.data.error.message;
    }
    if (resp?.data?.message) {
      return resp.data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
};
