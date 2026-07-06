import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import app from "./socket.js";
import errorMiddleware from "./middlewares/error.middleware.js";

// Import Routes
import authRouter from "./routes/auth.js";
import stripeRouter from "./routes/stripe.js";
import authenticatedRouter from "./routes/authenticatedRouter.js";
import auth from "./middlewares/auth.middleware.js";

// For .env.* files (process.env.ENV_VARIABLES)
dotenv.config();

// Exporting Global __filename and __dirname
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

app.use("/api/webhook", stripeRouter);

// Parse req.body
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/authenticated", auth, authenticatedRouter);
app.use("/api/auth", authRouter);

// Error middleware to handle all errors
app.use(errorMiddleware);