import { Router } from "express";
import cartController from "../controllers/cart.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", cartController.getCartItems);

router.post("/items/:productId", cartController.addToCart);

router.put("/items/:productId/increment", cartController.incrementCartItem);

router.put("/items/:productId/decrement", cartController.decrementCartItem);

router.delete("/items/:productId", cartController.removeCartItem);

router.delete("/", cartController.clearCartItems);

export default router;