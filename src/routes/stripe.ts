import express from "express";
import stripeController from "../controllers/stripe.controller.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), stripeController.handleWebhookEvent);

export default router;