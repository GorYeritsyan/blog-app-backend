import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import {UnauthorizedError} from "./errors/index.js";
import jwt, {JwtPayload} from "jsonwebtoken";
import tokenService from "./services/token.service.js";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        credentials: true,
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new UnauthorizedError());

    try {
        const decoded = tokenService.verifyToken(token, "access") as JwtPayload & { userId: number };
        socket.data.userId = decoded.userId;
        next();
    } catch (err) {
        next(new UnauthorizedError("Invalid or expired token"))
    }
});

io.on("connection", (socket) => {
    console.log(`user with id ${socket.data.userId} connected`);

    socket.on("disconnect", () => {
        console.log(`user with id ${socket.data.userId} disconnected`);
    });
    // socket.emit("join", socket.id);
});

// Listen provided port
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

export default app;