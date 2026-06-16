import { prisma } from "../lib/prisma.js";
import {BadRequestError} from "../errors/index.js";

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

    async createRoom({ roomId, name, memberIds, currentUserId }) {
        const allIds = [...new Set([currentUserId, ...memberIds])];

        const users = await prisma.user.findMany({
            where: {
                id: { in: allIds }
            },
            select: {
                id: true
            }
        });

        if (users.length !== allIds.length) {
            const userIds = users.map((user) => user.id);
            const missing = allIds.filter(id => !userIds.includes(id));

            throw new BadRequestError(`Users not found: ${missing.join(", ")}`);
        }

        return prisma.room.create({
            data: {
                name,
                type: "GROUP",
                members: {
                    create: allIds.map(userId => ({ userId })),
                },
            }
        });
    }

    async updateRoom({ roomId, name, memberIds, currentUserId }) {
        const existingRoom = await prisma.room.findUnique({
            where: { id: roomId },
            include: { members: true }
        });

        if (!existingRoom) {
            throw new BadRequestError(`Room with id ${roomId} not found`);
        }

        const allIds = [...new Set([currentUserId, ...memberIds])];

        const users = await prisma.user.findMany({
            where: { id: { in: allIds } },
            select: { id: true }
        });

        if (users.length !== allIds.length) {
            const userIds = users.map((user) => user.id);
            const missing = allIds.filter(id => !userIds.includes(id));
            throw new BadRequestError(`Users not found: ${missing.join(", ")}`);
        }

        // Delete members that are no longer in the list
        const membersToRemove = existingRoom.members.filter(
            m => !allIds.includes(m.userId)
        );

        if (membersToRemove.length > 0) {
            await prisma.member.deleteMany({
                where: {
                    roomId: existingRoom.id,
                    userId: { in: membersToRemove.map(m => m.userId) }
                }
            });
        }

        return prisma.room.update({
            where: { id: existingRoom.id },
            data: {
                name,
                members: {
                    connectOrCreate: allIds.map(id => ({
                        where: {
                            roomId_userId: {
                                roomId: existingRoom.id,
                                userId: id
                            }
                        },
                        create: {
                            userId: id,
                        }
                    }))
                }
            },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });
    }
}

export default new RoomService();