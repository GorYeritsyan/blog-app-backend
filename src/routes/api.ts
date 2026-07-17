import { Router } from "express";

import blogRouter from "./blog.js";
import usersRouter from "./users.js";
import friendsRouter from "./friends.js";
import messagesRouter from "./messages.js";
import roomsRouter from "./rooms.js";
import productsRouter from "./products.js";
import cartRouter from "./cart.js";
import checkoutRouter from "./checkout.js";
import ordersRouter from "./orders.js";
import plansRouter from "./plans.js";
import subscriptionsRouter from "./subscriptions.js";
import chatRouter from "./chat.js";
import aiChatRouter from "./ai-chat.js";

const router = Router();

// Authenticated Routes
router.use("/blog", blogRouter);
router.use("/users", usersRouter);
router.use("/friends", friendsRouter);
router.use("/messages", messagesRouter);
router.use("/rooms", roomsRouter);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/checkout/session", checkoutRouter);
router.use("/orders", ordersRouter);
router.use("/plans", plansRouter);
router.use("/subscriptions", subscriptionsRouter);
// router.use("/chat", chatRouter);
router.use("/chat", aiChatRouter);

export default router;