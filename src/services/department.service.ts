import { DepartmentModel } from "../models";
import { Types } from "mongoose";

export const createDepartment = async (employer: string, input: any) => {
  const department = await DepartmentModel.create({ ...input, employer: new Types.ObjectId(employer) });
  return department;
};

export const listDepartments = async (employer: string) => {
    const departments = await DepartmentModel.find({ employer: new Types.ObjectId(employer) });
    return departments;
};

export const getDepartmentByName = async (employer: string, name: string) => {
    const department = await DepartmentModel.findOne({ employer: new Types.ObjectId(employer), name });
    return department;
}

export default {
    createDepartment,
    listDepartments,
    getDepartmentByName
};