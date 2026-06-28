import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import app from "./socket.js";
import errorMiddleware from "./middlewares/error.middleware.js";

// Import Routes
import blogRouter from "./routes/blog.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import friendsRouter from "./routes/friends.js";
import messagesRouter from "./routes/messages.js";
import roomsRouter from "./routes/rooms.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";

// For .env.* files (process.env.ENV_VARIABLES)
dotenv.config();

// Exporting Global __filename and __dirname
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Parse req.body
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/api/blog", blogRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/friends", friendsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter)

// Error middleware to handle all errors
app.use(errorMiddleware);

export default app;