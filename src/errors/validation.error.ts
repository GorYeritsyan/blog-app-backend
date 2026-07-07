import { ValidationErrorItem } from "joi";
import { AppError } from "./app.error.js";

export class ValidationError extends AppError {
    constructor(message: string, details: ValidationErrorItem[])  {
        const formattedDetails = details.map(detail => ({ [detail.path[0]]: detail.message }));

        super(message, 400, formattedDetails);
    }
}