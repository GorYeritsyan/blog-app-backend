import { AppError } from "./app.error.js";

// Custom errors

// Not found error
export class NotFoundError extends AppError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

// Unauthorized error
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

// Forbidder error (when user don't have permission to do some action)
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

// Bad Request error
export class BadRequestError extends AppError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

// Conflict error
export class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}