import {Response} from "express";
import {AuthRequest} from "../types/types.js";
import planService from "../services/plan.service.js";

class PlanController {
    async getAllPlans(req: AuthRequest, res: Response) {
        const plans = await planService.getAllPlans();

        res.json({ success: true, data: plans });
    }
}

export default new PlanController();