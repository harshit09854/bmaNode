import type { Request } from 'express';
import { IUser } from './models/userModel'; // Assuming you'll create this interface
import { IAdmin } from './models/adminModel'; // Assuming you'll create this interface

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      admin?: IAdmin;
    }
  }
}
