import {
    createEmployer,
    employerLogin,
    updateEmployer,
} from "../controllers/employer.controller";
import { auth } from "../middlewares/auth";

import ZodMiddleware from "../middlewares/zodMiddleware";
import { createEmployerSchema, loginEmployerSchema, updateEmployerSchema } from "../zodSchemas";

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

    router.put("/api/v1/employers", auth("employer"), ZodMiddleware(updateEmployerSchema), updateEmployer);
};
