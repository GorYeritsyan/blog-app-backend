import { Response } from "express";
import cartService from "../services/cart.service.js";
import {AuthRequest} from "../types/types.js";

class CartController {
    async getCartItems(req: AuthRequest, res: Response) {
        const currentUserId = req.userId

        const cartItems = await cartService.getCartItems(currentUserId!);

        res.json({ success: true, data: cartItems });
    }

    async addToCart(req: AuthRequest<{ productId: string }, {}, { productId: number; quantity: number }>, res: Response) {
        const { productId } = req.params;
        const { quantity } = req.body;

        const cartItem = await cartService.addToCart({ currentUserId: req.userId!, productId: +productId, quantity });

        res.status(201).json({ success: true, data: cartItem });
    }

    async updateCartItem(req: AuthRequest, res: Response) {
        const { productId } = req.params;
        const { quantity } = req.body;

        cartService.updateCartItem({ userId: req.userId!, productId: +productId, quantity: quantity });

    }

    async clearCartItems(req: AuthRequest, res: Response) {
        const currentUserId = req.userId;

        const removedCartItems = await cartService.clearCartItems(currentUserId!);

        res.status(200).json({ success: true, data: removedCartItems });
    }
}

export default new CartController();