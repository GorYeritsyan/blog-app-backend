import { prisma } from "../lib/prisma.js";

class RoomService {
    async getAllRooms(userId: number) {
        return prisma.room.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            orderBy: {
                updatedAt: "desc"
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            },
        });
    }
}

export default new RoomService();