import { prisma } from "../lib/prisma.js";

class UserService {
    async getAllUsers({ query, page, limit }) {
        const skip = (+page - 1) * +limit;

        const users = await prisma.user.findMany({
            where: {
                ...(query && {
                    name: { contains: query, mode: "insensitive" },
                }),
            },

            // Pagination
            take: +limit,
            skip,

            select: {
                id: true,
                name: true,
                email: true
            }
        });

        return users;
    }
}

export default new UserService();