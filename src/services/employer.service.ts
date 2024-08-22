import { EmployerModel } from "../models";

export const getEmployerByEmail = (email: string) => {
    return EmployerModel.findOne({ email });
};

export const createANewEmployer = (
    params: Record<string, any>,
    password: any
) => {
    return new EmployerModel({ ...params, password }).save();
};


export const updateEmployer = (employer: {
    _id: string;
    loginTime: string;
}) => {
    return EmployerModel.findByIdAndUpdate(employer._id, employer, {
        new: true,
    });
};
