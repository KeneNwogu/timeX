import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Jwt } from "jsonwebtoken";

import { NotAuthorizedError } from "../errors/not-authorized-error";
import { EmployerModel, StaffModel } from "../models";

declare global {
  namespace Express {
    interface Request {
      user: UserData;
      token: Jwt | string;
    }
  }
}

export interface UserData {
  id: string;
  email: string;
  role: "employer" | "staff";
}

interface Payload extends JwtPayload {}

export const auth = (...authRoles: ("employer" | "staff")[]) => async (req: Request, _: Response, next: NextFunction) => {
  const headerAuth = req.header("Authorization");

  if (!headerAuth) {
    throw new NotAuthorizedError();
  }

  const token = headerAuth.replace("Bearer ", "");
  if(!token) throw new NotAuthorizedError();

  const key = process.env.JWT_SECRET_KEY;

  try {
    const payload = jwt.verify(token, key!) as Payload;

    if(authRoles.length && !authRoles.includes(payload.role as "employer" | "staff")){
      throw new NotAuthorizedError(`Invalid authentication role. Please log in as a ${payload.role}`);
    }
    
    req.user = payload as UserData;
    req.token = token;

  } catch (err: any) {
    throw new NotAuthorizedError(err.message);
  }

  next();
};

// export const restrictTo = (roles: number) => async (req, res, next) => {
//   const user = await UserDataAgent.getUserByEmailorUsername(req.user.email);
//   if (user.result?.role !== roles) {
//     return res.status(403).json({
//       status: false,
//       code: 403,
//       message: "You are not authorised, contact an Administator",
//     });
//   }
//   next();
// };
