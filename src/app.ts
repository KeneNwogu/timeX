import express, { Request, Response } from "express";
import mongoose from "mongoose";
import ZodMiddleware from "./middlewares/zodMiddleware";
import { createEmployerSchema, createStaffSchema, loginEmployerSchema, loginStaffSchema } from "./zodSchemas";
import { createEmployer, createStaff, employerLogin, loginStaff } from "./controllers";
import { config } from "dotenv";
import bodyParser from "body-parser";
import 'express-async-errors'
import { errorHandler } from "./middlewares/errorHandler";
import { auth } from "./middlewares/auth";

declare global {
    namespace Express {
      interface Request {
      }
    }
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: any
        }
    }
}

config()

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('connected to db'))

app.get('/health', (req: Request, res: Response) => res.status(200).end())
app.post('/api/v1/employers', ZodMiddleware(createEmployerSchema), createEmployer)
app.post('/api/v1/employers/tokens', ZodMiddleware(loginEmployerSchema), employerLogin)
app.post('/api/v1/staffs', auth('employer'), ZodMiddleware(createStaffSchema), createStaff),
app.post('/api/v1/staffs/tokens', ZodMiddleware(loginStaffSchema),loginStaff)

app.use(errorHandler)
app.listen(port, () => {
    console.log('App listening on port ' + port)
})