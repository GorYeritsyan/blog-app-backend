import { AppError } from "../errors/index.js";
import { NextFunction, Request, Response } from "express";

const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }

    console.log(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
};

export default errorMiddleware;