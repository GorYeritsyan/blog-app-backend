import { Router } from "express";
import planController from "../controllers/plan.controller.js";

const router = Router();

router.get("/", planController.getAllPlans);

export default router;