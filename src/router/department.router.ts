import {
    createDepartment,
    deleteDepartment,
    getStaffByDepartment,
    listDepartments
} from "../controllers/department.controller";
import { auth } from "../middlewares/auth";

import ZodMiddleware from "../middlewares/zodMiddleware";
import { createDepartmentSchema } from "../zodSchemas";

import { Router } from "express";

export default (router: Router) => {
    router.post(
        "/departments",
        auth("employer"),
        ZodMiddleware(createDepartmentSchema),
        createDepartment
    );

    router.get(
        "/departments",
        auth("employer"),
        listDepartments
    );

    router.delete("/departments/:departmentId", auth("employer"), deleteDepartment)

    router.get("/departments/:departmentId/staff", auth("employer"), getStaffByDepartment)
};