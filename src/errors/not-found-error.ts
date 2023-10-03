import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(errorMessage?: string) {
    super(errorMessage || "Route not found");

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return {
      message: this.message || "Resource not found",
      status: false,
      code: this.statusCode,
    };
  }
}
