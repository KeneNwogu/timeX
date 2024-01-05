import { Router } from "express";
import employer from "./employer";
import staff from "./staff";
import departmentRouter from "./department.router";

const router = Router();

export default (): Router => {
    employer(router);
    staff(router);
    departmentRouter(router);
    return router;
};
