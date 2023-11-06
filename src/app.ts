import express, { Request, Response } from "express";
import mongoose from "mongoose";
import ZodMiddleware from "./middlewares/zodMiddleware";
import {
    createEmployerSchema,
    createStaffSchema,
    loginEmployerSchema,
    loginStaffSchema,
} from "./zodSchemas";
import {
    createStaff,
    getStaffDetails,
    listStaff,
    loginStaff,
} from "./controllers/staff.controller";
import { config } from "dotenv";
import "express-async-errors";
import { errorHandler } from "./middlewares/errorHandler";
import { auth } from "./middlewares/auth";
import cors from "cors";
import {
    createEmployer,
    employerLogin,
} from "./controllers/employer.controller";
import { celebrate, Segments, Joi, errors } from "celebrate";

declare global {
    namespace Express {
        interface Request {}
    }
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: any;
        }
    }
}

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("connected to db"));

const pageQuerySerializer = Joi.object().keys({
    page: Joi.number().optional(),
});

app.get("/health", (req: Request, res: Response) => res.status(200).end());
app.post(
    "/api/v1/employers",
    ZodMiddleware(createEmployerSchema),
    createEmployer
);
app.post(
    "/api/v1/employers/tokens",
    ZodMiddleware(loginEmployerSchema),
    employerLogin
);
app.post(
    "/api/v1/staffs",
    auth("employer"),
    ZodMiddleware(createStaffSchema),
    createStaff
);
app.get(
    "/api/v1/staffs",
    auth("employer"),
    celebrate({ [Segments.QUERY]: pageQuerySerializer }),
    listStaff
);
app.get("/api/v1/staffs/:staffId", auth("employer"), getStaffDetails);
app.post("/api/v1/staffs/tokens", ZodMiddleware(loginStaffSchema), loginStaff);

// app.use(errors());
app.use(errorHandler);

app.listen(port, () => {
    console.log("App listening on port " + port);
});
