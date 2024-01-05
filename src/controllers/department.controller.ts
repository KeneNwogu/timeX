import { Request, Response } from 'express';
import departmentService from '../services/department.service';
import { BadRequestError } from '../errors/bad-request-error';

// GET /departments
export const listDepartments = async (req: Request, res: Response) => {
    // Logic to fetch departments from the database
    const departments = await departmentService.listDepartments(req.user.id);

    return res.json({departments});
};

// POST /departments
export const createDepartment = async (req: Request, res: Response) => {
    // Logic to create a new department in the database
    const employer = req.user.id;
    const { name } = req.body;

    // Save department to the database
    // ...
    if(await departmentService.getDepartmentByName(employer, name))
        throw new BadRequestError("Department with this name already exists");

    const department = await departmentService.createDepartment(employer, req.body);
    return res.status(201).json({department});
};
