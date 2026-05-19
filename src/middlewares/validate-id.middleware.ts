import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/index.js";

const validateId = (req: Request, _res: Response, next: NextFunction) => {
    const { id } = req.params;

    // If ID is not valid number then throw error
    if (isNaN(+id)) throw new BadRequestError();

    // Go to next handler if ID is valid
    next();
}

export default validateId;