import {prisma} from "../lib/prisma.js";

class PlanService {
    async getAllPlans() {
        return prisma.plan.findMany({
            include: {
                subscriptions: true
            }
        });
    }
}

export default new PlanService();