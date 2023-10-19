import { Request, Response } from "express";
import { StaffLogModel, StaffModel } from "../models";
import { BadRequestError } from "../errors/bad-request-error";
import jwt from 'jsonwebtoken'
import { simpleDecryption, simpleEncryption } from "../utils/encrypt";
import { Types } from "mongoose";
import { loginGrantTemplate, sendMail } from "../utils/email";
import crypto from 'crypto'
import { dateToUTCDate, getCurrentDay, isEqualDates } from "../utils/date";
import { NotFoundError } from "../errors/not-found-error";


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

    // only log first entry time
    if(!staff.lastEntryTime || !isEqualDates(getCurrentDay(), getCurrentDay(staff.lastEntryTime))){
        staff.lastEntryTime = dateToUTCDate()
        await staff.save()
    }

    // create request log if not exists
    await StaffLogModel.updateOne({ entryDate: getCurrentDay(), staff: staff._id }, 
    { $set: { entryDate: getCurrentDay(), staff: staff._id, entryTime: dateToUTCDate() } }, { upsert: true })
    
    const token = jwt.sign({ id: staff.id, email: staff.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d'})
    return res.json({ staff, token })
}

export const listStaff = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1
    const limit = 10 // 10 items per page

    let staff = await StaffModel.find({ employer: new Types.ObjectId(req.user.id) })
    .limit(limit).skip((page - 1) * limit)

    const staffCount = await StaffModel.count()
    const totalPages = Math.ceil(staffCount / limit)

    const absoluteUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const next = page * limit >= staffCount ? null : `${absoluteUrl}`.replace(/page=\d+/g, `page=${page + 1}`)
    const previous = page > 1 ? `${absoluteUrl}`.replace(/page=\d+/g, `page=${page - 1}`) : null

    if(staff.length < 1) throw new NotFoundError("Invalid page")
    
    return res.json({ count: staff.length, totalPages, previous, next, staff })
}

export const getStaffDetails = async (req: Request, res: Response) => {
    let staffMember = await StaffModel.findOne({ employer: new Types.ObjectId(req.user.id), 
        _id: new Types.ObjectId(req.params.staffId) })
    if(!staffMember) throw new NotFoundError("staff member was not found")
    const entryLogs = await StaffLogModel.find({ staff: staffMember._id })
    return res.json({ staff: staffMember, entryLogs })
}