import dotenv from "dotenv";
dotenv.config();

export const {
    DATABASE_URL,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
} = process.env;