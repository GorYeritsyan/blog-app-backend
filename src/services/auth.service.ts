import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { LoginBody, RegisterBody, User } from "../types/types.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

class AuthService {
    async getMe(userId: number) {
        return prisma.user.findUnique({ where: { id: userId } });
    }

    // Login user service
    async login({ email, password }: LoginBody) {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Email is invalid");

        // Check if password match
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new Error("Password is invalid");

        // Generate access & refresh tokens
        const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        return { accessToken, refreshToken };
    }

    // Register user service
    async register({ name, email, password }: Omit<RegisterBody, "confirmPassword">): Promise<User> {
        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) throw new Error("User already exists");

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
         return prisma.user.create({ data: { name, email, password: hashedPassword } });
    }
}

export default new AuthService();