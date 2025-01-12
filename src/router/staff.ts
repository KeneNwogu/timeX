import {
    createStaff,
    deleteStaff,
    getStaffDetails,
    listStaff,
    loginStaff,
    updateStaff,
    updateStaffLogs
} from "../controllers/staff.controller";

import ZodMiddleware from "../middlewares/zodMiddleware";

import { createStaffSchema, loginStaffSchema, updateStaffLogsSchema, updateStaffSchema } from "../zodSchemas";

import { celebrate, Segments, Joi } from "celebrate";
import { auth } from "../middlewares/auth";

import { Router } from "express";

const pageQuerySerializer = Joi.object().keys({
    page: Joi.number().optional(),
});

export default (router: Router) => {
    router.post(
        "/staffs",
        auth("employer"),
        ZodMiddleware(createStaffSchema),
        createStaff
    );
    router.get(
        "/staffs",
        auth("employer"),
        // celebrate({ [Segments.QUERY]: pageQuerySerializer }),
        listStaff
    );
    router.get("/staffs/:staffId", auth("employer", "staff"), getStaffDetails);

    router.put("/staffs/:staffId", auth("employer", "staff"), 
    ZodMiddleware(updateStaffSchema), updateStaff);

    router.delete("/staffs/:staffId", auth("employer"), deleteStaff)

    router.post("/staffs/:staffId/logs", auth("employer"), 
    ZodMiddleware(updateStaffLogsSchema), updateStaffLogs)

    router.post(
        "/staffs/tokens",
        ZodMiddleware(loginStaffSchema),
        loginStaff
    );
};
