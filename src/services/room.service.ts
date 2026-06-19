import { prisma } from "../lib/prisma.js";
import {BadRequestError, NotFoundError} from "../errors/index.js";

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
                    take: 1,
                    include: {
                        sender: true
                    }
                }
            },
        });
    }

    async getRoomById(roomId: number) {
        return prisma.room.findUnique({
            where: {
                id: roomId
            },
            include: {
                members: {
                    include: {
                        user: true
                    },
                },
            }
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
            },
            include: {
                members: true
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

    async removeRoom(roomId: number) {
        return prisma.room.delete({
            where: {
                id: roomId
            }
        });
    }

    async leaveRoom({ roomId, userId }: { roomId: number; userId: number }) {
        const member = await prisma.member.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId,
                }
            }
        });

        if (!member) throw new BadRequestError("You are not a member of this room");

        return prisma.member.delete({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            }
        })
    }
}

export default new RoomService();