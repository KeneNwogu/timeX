import { Request, Response } from 'express';
import * as departmentService from '../services/department.service';
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';

// GET /departments
export const listDepartments = async (req: Request, res: Response) => {
    // Logic to fetch departments from the database
    const departments = await departmentService.paginatedListDepartments(req, req.user.id, Number(req.query.page || 1));
    return res.json(departments);
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


export const deleteDepartment = async (req: Request, res: Response) => {
    let department = await departmentService.getDepartmentById(req.user.id, req.params.departmentId)
    if(!department) throw new NotFoundError("department not found");

    await departmentService.deleteDepartment(department.id);
    return res.json({ success: true, message: "deleted department successfully" })
}


export const getStaffByDepartment = async (req: Request, res: Response) => {
    let department = await departmentService.getDepartmentById(req.user.id, req.params.departmentId)
    if(!department) throw new NotFoundError("department not found");

    let page = Number(req.query.page || 1)

    let data = await departmentService.paginateStaffByDepartment(req, department._id, 
        { page, limit: 10 }
    )
    return res.json({ ...data })
}