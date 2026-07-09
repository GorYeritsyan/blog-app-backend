import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/index.js";

const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            ...(err.details && { details: err.details })
        });

        return;
    }

    console.log(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
};

export default errorMiddleware;