import userService from "../services/user.service.js";
import { Request, Response } from "express";

class UserController {
    async getAllUsers(req: Request, res: Response) {
        const { query, page = "1", limit = "10" } = req.query;
        const users = await userService.getAllUsers({ query, page, limit });
        console.log(users);

        res.json({ success: true, data: users });
    }
}

export default new UserController();