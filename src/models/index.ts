import mongoose, { Types } from "mongoose";

const EmployerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true }
})

export const EmployerModel = mongoose.model('Employer', EmployerSchema)

const StaffSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    employer: { ref: "Employer", type: Types.ObjectId },
    role: { type: String, required: true },
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

