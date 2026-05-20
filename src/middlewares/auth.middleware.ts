import type { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import tokenService from "../services/token.service.js";
import { AuthRequest } from "../types/types.js";
import { UnauthorizedError } from "../errors/index.js";

// Middleware to protect API routes
const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    // If Auth header not present or there is no token provided then user is unauthorized
    if (!authHeader.startsWith("Bearer") || !token) {
        throw new UnauthorizedError();
    }

    try {
        const decoded = tokenService.verifyToken(token, "access") as JwtPayload & { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        next(new UnauthorizedError("Invalid token"));
    }
}

export default auth;