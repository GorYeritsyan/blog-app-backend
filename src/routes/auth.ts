import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", auth, authController.getMe);

// POST /auth/login
router.post("/login", authController.login);

// POST /auth/register
router.post("/register", authController.register);

router.get("/refresh", authController.refreshToken);

// POST /auth/logout
router.post("/logout", authController.logout);

export default router;