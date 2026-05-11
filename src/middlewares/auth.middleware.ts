import type { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { ACCESS_TOKEN_SECRET } from "../config/env.js";

// Middleware to protect API routes
const auth = async (req: Request & { userId?: number }, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];

    // If Auth header not present or there is no token provided then user is unauthorized
    if (!authHeader.startsWith("Bearer") || !token) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET!) as JwtPayload & { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(400).json({ status: false, message: "Invalid token" });
    }
}

export default auth;