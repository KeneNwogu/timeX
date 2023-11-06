// this is for all the database connection
import { StaffLogModel, StaffModel } from "../models";
import { Types } from "mongoose";
import crypto from "crypto";
import { dateToUTCDate, getCurrentDay } from "../utils/date";

export const createIdFromMongoose = (id: string) => {
    return new Types.ObjectId(id);
};

export const createANewStaff = (
    params: Record<string, any>,
    employerId: string
) => {
    const staff = new StaffModel({
        ...params,
        employer: createIdFromMongoose(employerId),
    });
    staff.authToken = staff.id + "-" + crypto.randomUUID();
    return staff;
};

export const getOneStaff = (email: string, id: string) => {
    return StaffModel.findOne({ email, employer: createIdFromMongoose(id) });
};

export const getStaffByToken = (token: string) => {
    return StaffModel.findOne({ authToken: token });
};

export const getStaffWithID = (id: string, employerId: string) => {
    return StaffModel.findOne({
        _id: createIdFromMongoose(id),
        employer: createIdFromMongoose(employerId),
    });
};

export const getStaffsWithPagination = (
    id: string,
    page: number,
    limit: number
) => {
    return StaffModel.find({ employer: createIdFromMongoose(id) })
        .limit(limit)
        .skip((page - 1) * limit);
};

export const getStaffLog = (staffId: any) => {
    return StaffLogModel.find({ staff: createIdFromMongoose(staffId) });
};

export const updateStaffLog = (staffId: any) => {
    return StaffLogModel.updateOne(
        { entryDate: getCurrentDay(), staff: staffId },
        {
            $set: {
                entryDate: getCurrentDay(),
                staff: staffId,
                entryTime: dateToUTCDate(),
            },
        },
        {
            upsert: true,
        }
    );
};
