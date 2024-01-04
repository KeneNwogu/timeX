import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

import { RequestValidationError } from "../errors/request-validation-error";


const ZodMiddleware =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try { 
      
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {

      const zErr = error as ZodError;
      
      throw new RequestValidationError(zErr); 
    }
  };

export default ZodMiddleware