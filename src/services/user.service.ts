import { prisma } from "../lib/prisma.js";
import {PaginatedQuery} from "../types/types.js";

class UserService {
    async getAllUsers({ query, page, limit, orderBy, order }: Required<PaginatedQuery>) {
        const skip = (+page - 1) * +limit;

        const users = await prisma.user.findMany({
            where: {
                ...(query && {
                    name: { contains: query, mode: "insensitive" },
                }),
            },

            orderBy: {
                [orderBy]: order
            },

            // Pagination
            take: +limit,
            skip,

            include: {
                sentFriendRequests: true
            }
        });

        // Get total users count
        // const totalUsers = await prisma.user.count({
        //     where: {
        //         ...(query && {
        //             name: { contains: query, mode: "insensitive" },
        //         }),
        //     }
        // });
        //
        // const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / +limit) : 1;

        return { users, totalPages: 10 };
    }
}

export default new UserService();