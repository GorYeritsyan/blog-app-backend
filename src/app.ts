import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// Import Routes
import blogRouter from "./routes/blog.js";
import authRouter from "./routes/auth.js";

// For .env.* files (process.env.ENV_VARIABLES)
dotenv.config();

// Exporting Global __filename and __dirname
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

const app = express();

// Parse req.body
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/api/blog", blogRouter);
app.use("/api/auth", authRouter);

// TODO: Add global Error handler
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});