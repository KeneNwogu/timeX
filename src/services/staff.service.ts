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

export const getStaffById = async (id: string) => {
    return await StaffModel.findOne({
        _id: createIdFromMongoose(id),
    });
};

export const getStaffByEmployer = (id: string, employerId: string) => {
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

export const getStaffLog = async (staffId: any) => {
    return await StaffLogModel.find({ staff: createIdFromMongoose(staffId) });
};

export const getStaffLoginMetrics = async(staffId: any) => {
    const pipeline = [
        { 
            $match: { 
                "staff": createIdFromMongoose(staffId) 
            } 
        },
        { 
            $group: {
                _id: { 
                    $dateToString: { format: "%Y-%m-01", date: "$entryTime" } 
                },
                totalLoginTimes: { $sum: 1 },
                totalLateLoginTimes: { 
                    $sum: { $cond: [{ $eq: ["$late", true] }, 1, 0] } 
                },
                totalEarlyLoginTimes: { 
                    $sum: { $cond: [{ $eq: ["$late", false] }, 1, 0] } 
                }
            }
        }
    ];
    
    return await StaffLogModel.aggregate(pipeline);
}

export const updateStaffLog = async (staffId: any) => {
    let staff = await StaffModel.findById(staffId);

    let log = await StaffLogModel.findOne({ entryDate: getCurrentDay(), staff: staffId });
    if(log) return log;   
    
    let employer = await EmployerModel.findById(staff.employer);

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
