import { prisma } from "../lib/prisma.js";
import { NotFoundError } from "../errors/index.js";

class FriendService {
    async getAllFriendRequests() {
        return prisma.friendRequest.findMany();
    }

    // Get current user all friends
    async getFriends(userId: number, query?: string) {
        const acceptedFriendRequests = await prisma.friendRequest.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: "ACCEPTED",
                ...(query && { name: { contains: query, mode: "insensitive" } }),
            },
            include: {
                sender: true,
                receiver: true
            },
        });

        const friends = acceptedFriendRequests.map(req => req.senderId === userId ? req.receiver : req.sender );
        return friends;
    }

    // Get all incoming requests that need to be accepted or rejected
    async getIncomingRequests(receiverId: number) {
        return prisma.friendRequest.findMany({
            where: {
                receiverId,
                status: "PENDING"
            },
            include: {
                sender: true,
            }
        });
    }

    // Send friend request
    async sendFriendRequest({ senderId, receiverId }: { senderId: number; receiverId: number }) {
        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ]
            }
        });

        // If there is no request, create new one
        if (!existingRequest) {
            return prisma.friendRequest.create({
                data: {
                    senderId,
                    receiverId
                }
            });
        }

        // If my request rejected, send again (update rejected to pending)
        if (existingRequest.senderId === senderId && existingRequest.status === "REJECTED") {
            return prisma.friendRequest.update({
                where: {
                    id: existingRequest.id
                },

                data: {
                    status: "PENDING"
                }
            })
        }

        // If someone send request to me, and I'm sending too, automatically accept it
        if (existingRequest.receiverId === senderId && existingRequest.status === "PENDING") {
            // return prisma.friendRequest.update({
            //     where: {
            //         id: existingRequest.id
            //     },
            //     data: {
            //         status: "ACCEPTED"
            //     }
            // })

            return await this.acceptFriendRequest(existingRequest.id!);
        }

        return existingRequest;
        // If status rejected then send friend request again
       //  return prisma.friendRequest.upsert({
       //     where: {
       //         senderId_receiverId: {
       //             senderId,
       //             receiverId,
       //         },
       //         status: "REJECTED"
       //     },
       //     update: {
       //         status: "PENDING"
       //     },
       //     create: { senderId, receiverId }
       // });
    }

    // Accept friend request
    // async acceptFriendRequest(requestId: number) {
    //     return prisma.friendRequest.update({
    //         where: { id: requestId },
    //         data: { status: "ACCEPTED" }
    //     });
    // }

    async acceptFriendRequest(requestId: number) {
        const acceptedFriendRequest = await prisma.friendRequest.findUnique({
            where: {
                id: requestId,
                status: "ACCEPTED"
            }
        });

        // If there is no accepted request with requestId, then accept friend request and create room for that members
        if (!acceptedFriendRequest) {
            return prisma.$transaction(async (tx) => {
                // accept the request
                const request = await tx.friendRequest.update({
                    where: { id: requestId },
                    data: { status: "ACCEPTED" }
                })

                // create the DM room between the two users
                const existingRoom = await tx.room.findFirst({
                    where: {
                        AND: [
                            { members: { some: { userId: request.senderId } } },
                            { members: { some: { userId: request.receiverId } } }
                        ],
                    }
                });

                // If room doesn't exist then create
                if (!existingRoom) {
                    await tx.room.create({
                        data: {
                            type: "DM",

                            members: {
                                create: [
                                    { userId: request.senderId },
                                    { userId: request.receiverId }
                                ]
                            }
                        }
                    });
                }

                return request
            });
        }

        return acceptedFriendRequest;
    }

    // Reject friend request
    async rejectFriendRequest(requestId: number) {
        return prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        });
    }

    async removeFriend({ userId, friendId }: { userId: number; friendId: number }) {
         const friendRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId }
                ]
            }
        });

         if (!friendRequest) throw new NotFoundError(`Friend with ID ${friendId} not found`);

         return prisma.friendRequest.delete({
             where: { id: friendRequest.id }
         });
    }
}

export default new FriendService();