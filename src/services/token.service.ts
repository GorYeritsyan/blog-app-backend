import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/env.js";

const tokens = {
    access: ACCESS_TOKEN_SECRET,
    refresh: REFRESH_TOKEN_SECRET,
}

class TokenService {
    signTokens(payload: { userId: number }) {
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        return { accessToken, refreshToken };
    }

    verifyToken(token: string, tokenType: "access" | "refresh") {
       return jwt.verify(token, tokens[tokenType]!);
    }
}

export default new TokenService();