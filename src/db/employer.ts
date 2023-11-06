import { EmployerModel } from "../models";

export const getEmployerByEmail = (email: string) => {
    return EmployerModel.findOne({ email });
};

export const createANewEmployer = (
    params: Record<string, any>,
    password: any
) => {
    return new EmployerModel({ ...params, password });
};
