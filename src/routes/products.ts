import { Router } from 'express';

import productController from "../controllers/product.controller.js";
import validateId from "../middlewares/validate-id.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

// get all products except current user created products
router.get("/", productController.getAllProducts);

// get current user products
router.get("/me", productController.getMyProducts);

router.get("/:id", validateId, productController.getProductById);

router.post("/", upload.single("image"), productController.createProduct);

router.put("/:id", validateId, upload.single("image"), productController.updateProduct);

router.delete("/:id", validateId, productController.deleteProduct);

export default router;