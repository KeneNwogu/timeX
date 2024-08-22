// this is for all the database connection
import { EmployerModel, StaffLogModel, StaffModel } from "../models";
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
    const { department, ...data } = params;

    const staff = new StaffModel({
        ...data,
        department: createIdFromMongoose(department),
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

export const updateStaffLog = async (staffId: any) => {
    let staff = await StaffModel.findById(staffId);

    let log = await StaffLogModel.findOne({ entryDate: getCurrentDay(), staff: staffId });
    if(log) return log;   
    
    let employer = await EmployerModel.findById(staff.employer);

    console.log(employer.loginTime);
    console.log(dateToUTCDate())
    console.log(dateToUTCDate(new Date(
        getCurrentDay().toISOString().split("T")[0] + `T${employer.loginTime}:00Z`
    )))

    console.log(dateToUTCDate() > dateToUTCDate(new Date(
        getCurrentDay().toISOString().split("T")[0] + `T${employer.loginTime}:00Z`
    )))

    let late = dateToUTCDate() > dateToUTCDate(new Date(
        getCurrentDay().toISOString().split("T")[0] + `T${employer.loginTime}:00Z`
    ));

    await StaffLogModel.create({
        entryDate: getCurrentDay(),
        staff: staffId,
        entryTime: dateToUTCDate(),
        late
    });

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
