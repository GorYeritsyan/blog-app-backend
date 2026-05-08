import dotenv from "dotenv";
dotenv.config();

export const {
    DATABASE_URL,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
} = process.env;