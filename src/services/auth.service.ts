import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma.js";
import { LoginBody, RegisterBody, User } from "../types/types.js";
import tokenService from "./token.service.js";
import { ConflictError } from "../errors/http.error.js";
import { UserDto } from "../dto/user.dto.js";

class AuthService {
    async getMe(userId: number) {
        return prisma.user.findUnique({ where: { id: userId }, include: { sentFriendRequests: true, receivedFriendRequests: true } });
    }

    // Login user service
    async login({ email, password }: LoginBody) {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email }, omit: { password: false } });
        if (!user) throw new Error("Email is incorrect");

        // Check if password match
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new Error("Password is incorrect");

        // Generate access & refresh tokens
        const { accessToken, refreshToken } = tokenService.signTokens({ userId: user.id });

        return { user: new UserDto(user), accessToken, refreshToken };
    }

    // Register user service
    // TODO: Type safety for DTO's
    async register({ name, email, password }: Omit<RegisterBody, "confirmPassword">): Promise<Omit<User, "password">> {
        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) throw new ConflictError("User already exists");

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        return prisma.user.create({ data: { name, email, password: hashedPassword } });
    }
}

export default new AuthService();