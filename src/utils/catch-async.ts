import { NextFunction, RequestHandler, Response, Request } from "express";

// type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const catchAsync = (asyncFn: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await asyncFn(req, res, next);
        } catch (err) {
            next(err);
        }
    }
}

export default catchAsync;