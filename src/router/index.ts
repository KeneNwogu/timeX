import { Router } from "express";
import employer from "./employer";
import staff from "./staff";

const router = Router();

export default (): Router => {
    employer(router);
    staff(router);
    return router;
};
