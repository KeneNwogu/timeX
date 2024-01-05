import {
    createDepartment,
    listDepartments
} from "../controllers/department.controller";
import { auth } from "../middlewares/auth";

import ZodMiddleware from "../middlewares/zodMiddleware";
import { createDepartmentSchema } from "../zodSchemas";

import { Router } from "express";

export default (router: Router) => {
    router.post(
        "/api/v1/departments",
        auth("employer"),
        ZodMiddleware(createDepartmentSchema),
        createDepartment
    );
    router.get(
        "/api/v1/departments",
        auth("employer"),
        listDepartments
    );
};