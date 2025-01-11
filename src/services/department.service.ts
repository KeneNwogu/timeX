import { DepartmentModel, StaffModel } from "../models";
import { Types } from "mongoose";
import { paginate, PaginationOptions } from "../utils/pagination";
import { Request } from "express";

export const createDepartment = async (employer: string, input: any) => {
  const department = await DepartmentModel.create({ ...input, employer: new Types.ObjectId(employer) });
  return department;
};

export const listDepartments = async (employer: string) => {
    const departments = await DepartmentModel.find({ employer: new Types.ObjectId(employer) });
    return departments;
};

export const paginatedListDepartments = async (req: Request, employer: string, page: number, limit: number=10) => {
    return paginate(DepartmentModel, { employer: new Types.ObjectId(employer) }, { page, limit }, req);
}

export const getDepartmentByName = async (employer: string, name: string) => {
    const department = await DepartmentModel.findOne({ employer: new Types.ObjectId(employer), name });
    return department;
}

export const getDepartmentById = async (employer: string, id: string) => {
    try{
        const department = await DepartmentModel.findOne({ 
            employer: new Types.ObjectId(employer), 
            _id: new Types.ObjectId(id) 
        });
        return department;
    }
    catch(err){
        return null;
    }
}

export const deleteDepartment = async (departmentId: string) => {
    await DepartmentModel.findByIdAndDelete(departmentId);
}

export const paginateStaffByDepartment = async (
    req: Request, departmentId: Types.ObjectId, paginationOptions: PaginationOptions
) => {
    return await paginate(StaffModel, { department: departmentId }, paginationOptions, req)
}

// export default {
//     createDepartment,
//     listDepartments,
//     getDepartmentByName,
//     getDepartmentById,
//     paginatedListDepartments
// };