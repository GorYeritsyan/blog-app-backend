import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import errorMiddleware from "./middlewares/error.middleware.js";

// Import Routes
import blogRouter from "./routes/blog.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import friendsRouter from "./routes/friends.js";
import messagesRouter from "./routes/messages.js";
import roomsRouter from "./routes/rooms.js";

// For .env.* files (process.env.ENV_VARIABLES)
dotenv.config();

// Exporting Global __filename and __dirname
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

const app = express();
const server = createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:3000"],
//         credentials: true,
//     }
// });

// io.on("connection", (socket) => {
//    console.log(socket.id, "connected");
// });

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

// Error middleware to handle all errors
app.use(errorMiddleware);

// Listen provided port
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});