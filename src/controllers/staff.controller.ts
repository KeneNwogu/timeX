import { Request, Response } from "express";
import { StaffModel } from "../models";
import { BadRequestError } from "../errors/bad-request-error";
import jwt from "jsonwebtoken";
import { simpleDecryption, simpleEncryption } from "../utils/encrypt";
import { loginGrantTemplate, sendMail } from "../utils/email";
import { dateToUTCDate, getCurrentDay, isEqualDates } from "../utils/date";
import { NotFoundError } from "../errors/not-found-error";
import * as staffService from "../services/staff.service";
import * as departmentService from "../services/department.service";
import bcrypt from "bcrypt";

const setPageUrl = (url: string, page?: number) => {
    return `${url}`.replace(/page=\d+/g, `page=${page}`);
};

export const createStaff = async (req: Request, res: Response) => {
    let { email, firstName, lastName, phone, role, department } = req.body;

    // check if department exists
    const departmentExists = await departmentService.getDepartmentById(
        req.user.id,
        department
    );

    if (!departmentExists)
        throw new BadRequestError("Department does not exist");

    if (await staffService.getOneStaff(email, req.user.id))
        throw new BadRequestError("a staff with this email already exists");

    const staff = await staffService.createANewStaff(
        { email, firstName, lastName, phone, role, department },
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
    let { authToken, passwordAuth } = req.body;

    if (!authToken && !passwordAuth) 
        throw new BadRequestError("provide either an auth token or password");

    if (authToken && passwordAuth)
        throw new BadRequestError("provide either an auth token or password");

    let staff: any = null;

    if (authToken){
        try {
            authToken = simpleDecryption(authToken);
            staff = await staffService.getStaffByToken(authToken);
        } catch (error) {
            throw new BadRequestError("Invalid auth token provided");
        }
    }

    if (passwordAuth) {
        staff = await StaffModel.findOne({ email: passwordAuth.email });
        if (!staff) throw new BadRequestError("Invalid credentials");

        if (!bcrypt.compareSync(passwordAuth.password, staff.password))
            throw new BadRequestError("Invalid credentials");
    }

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

    await staffService.updateStaffLog(staff._id);

    const token = jwt.sign(
        { id: staff.id, email: staff.email, role: "staff" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );
    return res.json({ staff, token });
};

export const listStaff = async (req: Request, res: Response) => {
    const absoluteUrl = `${req.protocol}://${req.get("host")}${
        req.originalUrl
    }`;

    const page = Number(req.query.page) || 1;
    const limit = 10; // 10 items per page

    let staff = await staffService.getStaffsWithPagination(
        req.user.id,
        page,
        limit
    );

    const staffCount = await StaffModel.count({ employer: staffService.createIdFromMongoose(req.user.id) });
    const totalPages = Math.ceil(staffCount / limit);

    let next = page >= totalPages ? null : setPageUrl(absoluteUrl, page + 1);
    let previous = page > 1 ? setPageUrl(absoluteUrl, page - 1) : null;

    // if page is not set in the query string, set it to 1
    // if (!req.query || !req.query.page) {
    //     return res.json([]);
    // }

    if (staff.length < 1 && page > 1)
        throw new NotFoundError(
            "Invalid Page"
        );
    
    return res.json({ count: staff.length, totalPages, previous, next, staff });
};

export const getStaffDetails = async (req: Request, res: Response) => {
    if (req.user.role !== "employer" && req.user.id !== req.params.staffId)
        throw new BadRequestError("You are not authorized to perform this action");

    let staffMember = null;

    if(req.user.role === "employer")
        staffMember = await staffService.getStaffByEmployer(
            req.params.staffId,
            req.user.id
        );

    else staffMember = await staffService.getStaffById(req.params.staffId);

    if (!staffMember) throw new NotFoundError("Staff member was not found");
    const entryLogs = await staffService.getStaffLog(staffMember._id);
    const metrics = await staffService.getStaffLoginMetrics(staffMember._id);
    return res.json({ staff: staffMember, entryLogs, metrics });
};


export const updateStaff = async (req: Request, res: Response) => {
    let staff = await staffService.getStaffById(req.params.staffId);

    if(!staff) throw new BadRequestError("invalid staff id");

    // if user is not an employer, they can only update their own details
    if (req.user.role !== "employer" && req.user.id !== req.params.staffId)
        throw new BadRequestError("You are not authorized to perform this action");

    // if user is an employer, they can only update their staff details
    if (req.user.role === "employer" && req.user.id !== staff.employer.toString())
        throw new BadRequestError("You are not authorized to perform this action");

    let { password } = req.body;

    staff.password = bcrypt.hashSync(password, 10);
    await staff.save();

    return res.json({ staff });
}

export const deleteStaff = async (req: Request, res: Response) => {
    let staff = await staffService.getStaffById(req.params.staffId);

    if(!staff) throw new NotFoundError("staff not found");

    // if employer is not the employer of staff
    if (req.user.id !== staff.employer.toString())
        throw new BadRequestError("You are not authorized to perform this action");

    await staffService.deleteStaff(staff._id);

    return res.json({ success: true, message: "deleted staff member successfully" });
}
