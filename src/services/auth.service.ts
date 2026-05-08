import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginBody, RegisterBody, User } from "../types/types.js";
import db from "../db/index.js";
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} from "../config/env.js";
import { prisma } from "../lib/prisma.js";

class AuthService {
    // Login user service
    async login({ email, password }: LoginBody) {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        // const { rows: [user] } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
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
        console.log("Existing User", existingUser);
        // const { rows: [existingUser] } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({ data: { name, email, password } });
        // const { rows: [newUser] } = await db.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        //     [name, email, hashedPassword]);

        console.log("newUser", newUser);
        return newUser;
    }
}

export default new AuthService();