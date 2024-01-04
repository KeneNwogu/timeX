import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import cors from "cors";
import router from "./router";

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
    .then(() => console.log("Successfully connected to db"));

app.get("/health", (req: Request, res: Response) =>
    res.status(200).send("Good health").end()
);

// app.use(errors());
app.use(errorHandler);

app.listen(port, () => {
    console.log("App listening on port " + port);
});

app.use("/", router());
