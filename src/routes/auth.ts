import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const router = Router();

// POST /auth/login
router.post("/login", authController.login);

// POST /auth/register
router.post("/register", authController.register);

// POST /auth/logout
router.post("/logout", authController.logout);

export default router;