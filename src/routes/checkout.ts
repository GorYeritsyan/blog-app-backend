import { Router } from "express";
import checkoutController from "../controllers/checkout.controller.js";

const router = Router();

// POST - /api/checkout/session (create checkout session)
router.post("/", checkoutController.createCheckoutSession);

// GET - /api/checkout/session/:id (retrieve checkout session)
router.get("/:id", checkoutController.getCheckoutSession);

export default router;