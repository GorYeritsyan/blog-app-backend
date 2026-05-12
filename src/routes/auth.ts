import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/auth/me
router.get("/me", auth, authController.getMe);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/register
router.post("/register", authController.register);

// GET /api/auth/refresh
router.get("/refresh", authController.refreshToken);

// POST /api/auth/logout
router.post("/logout", authController.logout);

export default router;