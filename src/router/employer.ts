import {
    createEmployer,
    employerLogin,
} from "../controllers/employer.controller";

import ZodMiddleware from "../middlewares/zodMiddleware";
import { createEmployerSchema, loginEmployerSchema } from "../zodSchemas";

import { Router } from "express";

export default (router: Router) => {
    router.post(
        "/api/v1/employers",
        ZodMiddleware(createEmployerSchema),
        createEmployer
    );
    router.post(
        "/api/v1/employers/tokens",
        ZodMiddleware(loginEmployerSchema),
        employerLogin
    );
};
