import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { UnauthorizedError } from "./errors/index.js";
import { JwtPayload } from "jsonwebtoken";
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

const onlineUsers = new Map();

// Authentication middleware
io.use((socket, next) => {
    console.log(socket.id, "middleware");
    const token = socket.handshake.auth?.token;
    console.log("TOKEN", token);
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
    console.log("online map", onlineUsers);

    if (!onlineUsers.has(socket.data.userId)) {
        onlineUsers.set(socket.data.userId, socket.id);
    }

    console.log("online users", [...onlineUsers.keys()])

    io.emit("online_users", [...onlineUsers.keys()]);

    socket.on("disconnect", () => {
        console.log(`user with id ${socket.data.userId} disconnected`);
        onlineUsers.delete(socket.data.userId);
        io.emit("online_users", [...onlineUsers.keys()]);
    });
});

// Listen provided port
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

export default app;