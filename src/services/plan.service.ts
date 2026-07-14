import {prisma} from "../lib/prisma.js";

class PlanService {
    async getAllPlans() {
        return prisma.plan.findMany();
    }
}

export default new PlanService();