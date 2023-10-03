import { Request, Response } from "express";
import { EmployerModel, StaffLogModel, StaffModel } from "../models";
import bcrypt from 'bcrypt'
import { BadRequestError } from "../errors/bad-request-error";
import jwt from 'jsonwebtoken'
import { simpleDecryption, simpleEncryption } from "../utils/encrypt";
import { Types } from "mongoose";
import { loginGrantTemplate, sendMail } from "../utils/email";
import crypto from 'crypto'
import { getCurrentDay } from "../utils/date";

export const createEmployer = async (req: Request, res: Response) => {
    let {
        firstName,
        lastName,
        companyName,
        email,
        phone,
        password
    } = req.body

    if(await EmployerModel.findOne({ email })) throw new BadRequestError("Employer with this email exists")

    const employer = await EmployerModel.create({ firstName, lastName, companyName, email, phone, 
        password: bcrypt.hashSync(password, 10)})
    return res.json({ employer }).end()
}

export const employerLogin = async (req: Request, res: Response) => {
    let { email, password } = req.body
    const employer = await EmployerModel.findOne({ email })
    if(!employer) throw new BadRequestError("Invalid email or password")

    if(!bcrypt.compareSync(password, employer.password)) throw new BadRequestError("Invalid email or password")

    const token = jwt.sign({ id: employer.id, email: employer.email }, process.env.JWT_SECRET_KEY, 
        { expiresIn: '1d'})
    return res.json({ employer, token })
}

export const createStaff = async (req: Request, res: Response) => {
    let {
        email,
        firstName,
        lastName,
        phone,
        role
    } = req.body

    if(await StaffModel.findOne({ email, employer: new Types.ObjectId(req.user.id) })) 
        throw new BadRequestError("a staff with this email already exists")

    const staff = await StaffModel.create({ email, firstName, lastName, phone, role, 
        employer: new Types.ObjectId(req.user.id) })
    staff.authToken = staff.id + '-' + crypto.randomUUID()
    await staff.save()

    // send email to staff
    await sendMail(staff.email, "Login Grant", loginGrantTemplate(staff.firstName, 
        simpleEncryption(staff.authToken)))
    return res.json({ staff })
}

export const loginStaff = async (req: Request, res: Response) => {
    let { authToken } = req.body
    if(!authToken) throw new BadRequestError("Invalid auth token provided")

    try {
        authToken = simpleDecryption(authToken)
    } catch (error) {
        throw new BadRequestError("Invalid auth token provided")
    }
    
    let staff = await StaffModel.findOne({ authToken })

    if(!staff) throw new BadRequestError("Invalid auth token provided")

    // create request log if not exists
    await StaffLogModel.updateOne({ entryDate: getCurrentDay(), staff: staff._id }, 
    { $set: {entryDate: getCurrentDay(), staff: staff._id} }, { upsert: true })
    
    const token = jwt.sign({ id: staff.id, email: staff.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d'})
    return res.json({ staff, token })
}