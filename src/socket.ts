import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import { UnauthorizedError } from "./errors/index.js";
import { JwtPayload } from "jsonwebtoken";
import tokenService from "./services/token.service.js";
import messageService from "./services/message.service.js";

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
    if (!onlineUsers.has(socket.data.userId)) {
        onlineUsers.set(socket.data.userId, socket.id);
    }

    // Show online users
    io.emit("online_users", [...onlineUsers.keys()]);

    // Handle join room
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
    });

    // Message handler
    socket.on("message", async ({ roomId, content }, callback) => {
        const currentUserId = socket.data.userId;

        const sentMessage = await messageService.sendMessage({ currentUserId: currentUserId!, roomId, content });

        io.to(roomId).emit("message", sentMessage);
        callback();
    });

    // Handle typing indicator
    socket.on("typing", ({ roomId, user, isTyping }) => {
        console.log("typing")
        const currentUserId = socket.data.userId;
        io.to(roomId).emit("typing", { roomId, user, userId: currentUserId, isTyping });
    });

    // Disconnection handler
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