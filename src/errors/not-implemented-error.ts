import { CustomError } from "./custom-error";

export class NotImplementedError extends CustomError {
  statusCode = 501;

  constructor(errorMessage?: string) {
    super(errorMessage || "not implemented");

    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }

  serializeErrors() {
    return {
      message: this.message || "request not implemented",
      status: false,
      code: this.statusCode,
    };
  }
}
