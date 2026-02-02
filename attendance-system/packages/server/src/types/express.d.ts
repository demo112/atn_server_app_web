import { UserRole } from '@attendance/shared';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: UserRole;
    }

    interface Request {
      user?: User;
    }
  }
}
