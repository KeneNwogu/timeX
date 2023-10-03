import { Request, Response, NextFunction } from 'express';

class MulterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MulterError';
    }
}

const multerErrorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof MulterError) {
        return res.status(500).json({
            status: false,
            message: err.message,
            code: 500,
        });
    }

    next(err);
};

export { MulterError, multerErrorMiddleware };