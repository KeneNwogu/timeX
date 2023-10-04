import { CustomError } from "./custom-error";
import { ZodError } from "zod";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public error: ZodError) {
    super("Invalid request");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    const errors = {}
    this.error.issues.forEach(issue => {
      if(errors[issue.path[0]]) errors[issue.path[0]].push(issue.message)
      else errors[issue.path[0]] = [issue.message]
    })
    return { 
      errors,
      message: `invalid request payload`,
      code: this.statusCode,
      status: false,
      resource: "Validation",
    };
  }
}
