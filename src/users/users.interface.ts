export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}
interface Profile {
    id: string;
    userId: string;
    bio?: string | null;
    avatarUrl?: string | null;
}

export interface Users {
    id: string;
    name: string;
    email: string;
    password: string;
    role?: Role;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    profile?: Profile | null;
}
