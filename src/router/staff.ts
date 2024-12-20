import {
    createStaff,
    getStaffDetails,
    listStaff,
    loginStaff,
    updateStaff
} from "../controllers/staff.controller";

import ZodMiddleware from "../middlewares/zodMiddleware";

import { createStaffSchema, loginStaffSchema, updateStaffSchema } from "../zodSchemas";

import { celebrate, Segments, Joi } from "celebrate";
import { auth } from "../middlewares/auth";

import { Router } from "express";

const pageQuerySerializer = Joi.object().keys({
    page: Joi.number().optional(),
});

export default (router: Router) => {
    router.post(
        "/api/v1/staffs",
        auth("employer"),
        ZodMiddleware(createStaffSchema),
        createStaff
    );
    router.get(
        "/api/v1/staffs",
        auth("employer"),
        // celebrate({ [Segments.QUERY]: pageQuerySerializer }),
        listStaff
    );
    router.get("/api/v1/staffs/:staffId", auth("employer", "staff"), getStaffDetails);

    router.put("/api/v1/staffs/:staffId", auth("employer", "staff"), 
    ZodMiddleware(updateStaffSchema), updateStaff);

    router.post(
        "/api/v1/staffs/tokens",
        ZodMiddleware(loginStaffSchema),
        loginStaff
    );
};
