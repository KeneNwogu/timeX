import { string, object } from "zod";

export const createEmployerSchema = object({
    firstName: string({ required_error: "first name is required" }).min(4),
    lastName: string({ required_error: "last name is required" }).min(3),
    email: string({ required_error: "email is required" }).email(),
    companyName: string({ required_error: "company name is required" }).min(3),
    phone: string().optional(),
    password: string({ required_error: "password is required" }).min(6)
}).strict()

export const updateEmployerSchema = object({
    loginTime: string({ required_error: "login time is required" })
    .regex(new RegExp(/^([01]\d|2[0-3]):([0-5]\d)$/), "specify time in 24h format").min(4)
})

export const createDepartmentSchema = object({
    name: string({ required_error: "department name is required" }).min(3),
})

export const loginEmployerSchema = object({
    email: string({ required_error: "email is required" }),
    password: string({ required_error: "password is required" })
}).strict()


export const createStaffSchema = object({
    firstName: string({ required_error: "first name is required" }).min(4),
    lastName: string({ required_error: "last name is required" }).min(3),
    email: string({ required_error: "email is required" }).email(),
    phone: string().optional(),
    role: string({ required_error: "specify a role for your staff member"}),
    department: string({ required_error: "specify a department for your staff member"}),
})

export const loginStaffSchema = object({
    authToken: string({ required_error: "email is required" }),
}).strict()