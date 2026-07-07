import { Router } from "express";

import blogRouter from "./blog.js";
import usersRouter from "./users.js";
import friendsRouter from "./friends.js";
import messagesRouter from "./messages.js";
import roomsRouter from "./rooms.js";
import productsRouter from "./products.js";
import cartRouter from "./cart.js";
import checkoutRouter from "./checkout.js";

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

export default router;