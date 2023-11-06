import { Request, Response } from "express";
import { StaffModel } from "../models";
import { BadRequestError } from "../errors/bad-request-error";
import jwt from "jsonwebtoken";
import { simpleDecryption, simpleEncryption } from "../utils/encrypt";
import { loginGrantTemplate, sendMail } from "../utils/email";
import { dateToUTCDate, getCurrentDay, isEqualDates } from "../utils/date";
import { NotFoundError } from "../errors/not-found-error";
import * as dbAction from "../db/staff";

export const createStaff = async (req: Request, res: Response) => {
    let { email, firstName, lastName, phone, role } = req.body;

    if (await dbAction.getOneStaff(email, req.user.id))
        throw new BadRequestError("a staff with this email already exists");

    const staff = await dbAction.createANewStaff(
        { email, firstName, lastName, phone, role },
        req.user.id
    );
    await staff.save();

    // send email to staff
    await sendMail(
        staff.email,
        "Login Grant",
        loginGrantTemplate(staff.firstName, simpleEncryption(staff.authToken))
    );
    return res.json({ staff });
};

export const loginStaff = async (req: Request, res: Response) => {
    let { authToken } = req.body;
    if (!authToken) throw new BadRequestError("Invalid auth token provided");

    try {
        authToken = simpleDecryption(authToken);
    } catch (error) {
        throw new BadRequestError("Invalid auth token provided");
    }

    let staff = await dbAction.getStaffByToken(authToken);

    if (!staff) throw new BadRequestError("Invalid auth token provided");

    // only log first entry time
    if (
        !staff.lastEntryTime ||
        !isEqualDates(getCurrentDay(), getCurrentDay(staff.lastEntryTime))
    ) {
        staff.lastEntryTime = dateToUTCDate();
        await staff.save();
    }

    // create request log if not exists

    await dbAction.updateStaffLog(staff._id);

    const token = jwt.sign(
        { id: staff.id, email: staff.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );
    return res.json({ staff, token });
};

export const listStaff = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = 10; // 10 items per page

    let staff = await dbAction.getStaffsWithPagination(
        req.user.id,
        page,
        limit
    );

    const staffCount = await StaffModel.count();
    const totalPages = Math.ceil(staffCount / limit);

    const absoluteUrl = `${req.protocol}://${req.get("host")}${
        req.originalUrl
    }`;

    const next =
        page * limit >= staffCount
            ? null
            : `${absoluteUrl}`.replace(/page=\d+/g, `page=${page + 1}`);
    const previous =
        page > 1
            ? `${absoluteUrl}`.replace(/page=\d+/g, `page=${page - 1}`)
            : null;

    if (staff.length < 1) throw new NotFoundError("Invalid page");

    return res.json({ count: staff.length, totalPages, previous, next, staff });
};

export const getStaffDetails = async (req: Request, res: Response) => {
    let staffMember = await dbAction.getStaffWithID(
        req.params.staffId,
        req.user.id
    );
    if (!staffMember) throw new NotFoundError("staff member was not found");
    const entryLogs = await dbAction.getStaffLog(staffMember._id);
    return res.json({ staff: staffMember, entryLogs });
};
