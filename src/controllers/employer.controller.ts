import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { BadRequestError } from "../errors/bad-request-error";
import {
    createANewEmployer,
    getEmployerByEmail,
    updateEmployer as updateEmployerService,
} from "../services/employer.service";
import jwt from "jsonwebtoken";

export const createEmployer = async (req: Request, res: Response) => {
    let { firstName, lastName, companyName, email, phone, password } = req.body;

    if (await getEmployerByEmail(email))
        throw new BadRequestError("Employer with this email already exists");

    const employer = await createANewEmployer(
        { firstName, lastName, companyName, email, phone },
        bcrypt.hashSync(password, 10)
    );
    return res.json({ employer }).end();
};

export const employerLogin = async (req: Request, res: Response) => {
    let { email, password } = req.body;
    const employer = await getEmployerByEmail(email);
    if (!employer) throw new BadRequestError("Invalid email");

    if (!bcrypt.compareSync(password, employer.password))
        throw new BadRequestError("Invalid credentials");

    const token = jwt.sign(
        { id: employer.id, email: employer.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );
    return res.json({ employer, token });
};

export const updateEmployer = async (req: Request, res: Response) => {
    let { loginTime } = req.body;
    
    const employer = await updateEmployerService({
        _id: req.user.id,
        loginTime,
    });

    return res.json({ employer });
}
