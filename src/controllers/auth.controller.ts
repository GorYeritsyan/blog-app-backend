import type { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import authService from "../services/auth.service.js"
import { loginSchema, registerSchema } from "../validations/index.js";
import { AuthRequest, LoginBody, RegisterBody } from "../types/types.js";
import tokenService from "../services/token.service.js";

class AuthController {
    async getMe(req: AuthRequest, res: Response) {
        const user = await authService.getMe(req.userId!);
        res.json({ success: true, data: user });
    }

    async login(req: Request<{}, {}, LoginBody>, res: Response) {
        try {
            const validLoginBody = await loginSchema.validateAsync(req.body);
            const { accessToken, refreshToken } = await authService.login(validLoginBody);

            // Set refresh token in the cookies
            res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            // Send access token to client
            res.json({ success: true, message: "You have successfully logged in.", token: accessToken });
        } catch (err: any) {
            res.json({ status: false, error: err.message });
        }
    }

    async register(req: Request<{}, {}, RegisterBody>, res: Response) {
        try {
            const validRegisterBody = await registerSchema.validateAsync(req.body);

            const newUser = await authService.register(validRegisterBody);

            res.status(201).json({ success: true, message: "You have successfully registered", data: newUser });
        } catch(err: any) {
            res.status(400).json({ status: false, error: err.message });
        }
    }

    // Refresh token
    async refreshToken(req: Request, res: Response) {
        try {
            const decoded = tokenService.verifyToken(req.cookies.refreshToken, "refresh") as JwtPayload & { userId: number };
            const { accessToken, refreshToken } = tokenService.signTokens({ userId: decoded.userId });

            // Set refresh token in the cookie
            res.cookie("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            res.status(200).json({ success: true, token: accessToken });
        } catch (err: any) {
            res.status(400).json({ status: false, error: "Invalid token" });
        }
    }

    // TODO: Add logout logic & token service
    async logout(req: Request, res: Response) {
        res.clearCookie("refreshToken");

        res.status(200).json({ success: true, message: "You have successfully logged out." });
    }
}

export default new AuthController();