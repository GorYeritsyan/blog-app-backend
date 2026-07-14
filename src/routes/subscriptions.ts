import { Router } from "express";
import subscriptionController from "../controllers/subscription.controller.js";

const router = Router();

// GET /api/subscriptions/me
router.get("/me", subscriptionController.getUserSubscription);

// POST - /api/subscriptions/portal
router.post("/portal", subscriptionController.createBillingPortalSession);

// router.post("/portal", subscriptionController.updateSubscription);
export default router;