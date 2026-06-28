import { Router } from "express";
import cartController from "../controllers/cart.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, cartController.getCartItems);

router.post("/items/:productId", cartController.addToCart);

router.put("/items/:productId", cartController.updateCartItem);

router.delete("/", cartController.clearCartItems);

export default router;