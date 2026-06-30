import { Router } from 'express';

import productController from "../controllers/product.controller.js";
import validateId from "../middlewares/validate-id.middleware.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, productController.getAllProducts);

router.get("/:id", auth, validateId, productController.getProductById);

router.post("/", auth, productController.createProduct);

router.put("/:id", auth, validateId, productController.updateProduct);

router.delete("/:id", auth, validateId, productController.deleteProduct);

export default router;