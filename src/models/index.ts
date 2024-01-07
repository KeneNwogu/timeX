import mongoose, { Types, Model } from "mongoose";

const EmployerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, unique: true },
    password: { type: String, required: true }
})

export const EmployerModel = mongoose.model('Employer', EmployerSchema)

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employer: { ref: "Employer", type: Types.ObjectId }
})

export const DepartmentModel = mongoose.model('Department', DepartmentSchema)

const StaffSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false, unique: true },
    employer: { ref: "Employer", type: Types.ObjectId },
    role: { type: String, required: true },
    department: { ref: "Department", type: Types.ObjectId },
    authToken: { type: String, required: false },
    lastEntryTime: { type: Date, required: false }
})
export const StaffModel = mongoose.model('Staff', StaffSchema)

const StaffLogSchema = new mongoose.Schema({
    staff: { ref: "Staff", type: Types.ObjectId },
    entryDate: { type: Date, required: true },
    entryTime: { type: Date, required: true }
})
export const StaffLogModel = mongoose.model("StaffLog", StaffLogSchema)

