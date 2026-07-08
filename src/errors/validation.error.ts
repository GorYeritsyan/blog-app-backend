import { AppError } from "./app.error.js";

export class ValidationError extends AppError {
    constructor({ message, key }: { message: string; key: string })  {
        // const errors = details.reduce((acc: { [key: string]: string }, detail) => {
        //     acc[detail.path[0]] = detail.message;
        //     return acc;
        // }, {});
        const errors = { [key]: message };

        super(message, 400, errors);
    }
}