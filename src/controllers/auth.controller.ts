import type { Request, Response } from "express";
import authService from "../services/auth.service.js"
import { loginSchema, registerSchema } from "../validations/index.js";
import { LoginBody, RegisterBody } from "../types/types.js";

class AuthController {
    async getMe(req: Request, res: Response) {
        const user = await authService.getMe(req.userId);
        res.json({ success: true, user: user });
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

            res.status(201).json({ success: true, message: "You have successfully registered", user: newUser });
        } catch(err: any) {
            res.json({ status: false, error: err.message });
        }
    }

    async logout() {}
}

export default new AuthController();