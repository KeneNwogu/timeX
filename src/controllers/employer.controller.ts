import { Request, Response } from "express";
import { EmployerModel, StaffLogModel, StaffModel } from "../models";
import bcrypt from 'bcrypt'
import { BadRequestError } from "../errors/bad-request-error";
import jwt from 'jsonwebtoken'

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