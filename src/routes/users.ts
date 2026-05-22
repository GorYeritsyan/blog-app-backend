import { Router } from 'express';
import userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, userController.getAllUsers);

// router.post("/")

export default router;