import { User } from "../types/types.js";

// User DTO to not send password to client
export class UserDto {
    id: number;
    name: string;
    email: string;
    createdAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.createdAt = user.createdAt;
    }
}