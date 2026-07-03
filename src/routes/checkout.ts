import { Router } from "express";
import checkoutController from "../controllers/checkout.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

// POST - /api/checkout/session (create checkout session)
router.post("/", auth, checkoutController.createCheckoutSession);

// GET - /api/checkout/session/:id (retrieve checkout session)
router.get("/:id", auth, checkoutController.getCheckoutSession);

export default router;