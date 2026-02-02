export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(resource: string) {
    return new AppError(
      `ERR_${resource.toUpperCase()}_NOT_FOUND`,
      `${resource} not found`,
      404
    );
  }

  static badRequest(message: string, code?: string) {
    return new AppError(code || 'ERR_BAD_REQUEST', message, 400);
  }

  static conflict(message: string, code?: string) {
    return new AppError(code || 'ERR_CONFLICT', message, 409);
  }
}
