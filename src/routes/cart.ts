import { Router } from "express";
import cartController from "../controllers/cart.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, cartController.getCartItems);

router.post("/items/:productId", auth, cartController.addToCart);

router.put("/items/:productId/increment", auth, cartController.incrementCartItem);

router.put("/items/:productId/decrement", auth, cartController.decrementCartItem);

router.delete("/items/:productId", auth, cartController.removeCartItem);

router.delete("/", auth, cartController.clearCartItems);

export default router;