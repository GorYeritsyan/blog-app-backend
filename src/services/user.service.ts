import { prisma } from "../lib/prisma.js";

class UserService {
    async getAllUsers({ query, page, limit }: { query: string; page: number; limit: number }) {
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

        const totalCount = await prisma.user.count({
            where: {
                ...(query && {
                    name: { contains: query, mode: "insensitive" },
                }),
            }
        });

        return { users, totalCount };
    }
}

export default new UserService();