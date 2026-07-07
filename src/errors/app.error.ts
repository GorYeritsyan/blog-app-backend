export class AppError extends Error {
    statusCode: number;
    details?: { [key: string]: string }[];

    constructor(message: string, statusCode: number, details?: { [key: string]: string }[]) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}