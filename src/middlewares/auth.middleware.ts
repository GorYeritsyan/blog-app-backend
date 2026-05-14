import type { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import tokenService from "../services/token.service.js";
import { AuthRequest } from "../types/types.js";

// Middleware to protect API routes
const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    // If Auth header not present or there is no token provided then user is unauthorized
    if (!authHeader.startsWith("Bearer") || !token) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
    }

    try {
        const decoded = tokenService.verifyToken(token, "access") as JwtPayload & { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(400).json({ status: false, error: "Invalid token" });
    }
}

export default auth;