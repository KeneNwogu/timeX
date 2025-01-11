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
        "/employers",
        ZodMiddleware(createEmployerSchema),
        createEmployer
    );
    router.post(
        "/employers/tokens",
        ZodMiddleware(loginEmployerSchema),
        employerLogin
    );

    router.put("/employers", auth("employer"), ZodMiddleware(updateEmployerSchema), updateEmployer);
};
