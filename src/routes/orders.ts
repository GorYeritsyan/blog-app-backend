import { Router } from "express";
import orderController from "../controllers/order.controller.js";

const router = Router();

router.get("/", orderController.getAllOrders);

router.get("/:id", orderController.getOrderById);

export default router;