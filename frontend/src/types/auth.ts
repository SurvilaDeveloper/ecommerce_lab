//frontend/src/types/auth.ts
export type UserRole = "CUSTOMER" | "ADMIN";

export type AuthProvider = "LOCAL" | "GOOGLE";

export type AuthUser = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    authProvider: AuthProvider;
    avatarUrl: string | null;
};

export type AuthResponse = {
    user: AuthUser;
};