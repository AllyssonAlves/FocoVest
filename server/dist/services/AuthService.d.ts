import { IUser } from '../models/User';
import { University } from '../../../shared/dist/types';
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    university?: University;
    course?: string;
    graduationYear?: number;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: Partial<IUser>;
        token: string;
    };
}
export declare class AuthService {
    static register(data: RegisterData): Promise<AuthResponse>;
    static login(data: LoginData): Promise<AuthResponse>;
    static verifyEmail(token: string): Promise<AuthResponse>;
    static forgotPassword(email: string): Promise<AuthResponse>;
    static resetPassword(token: string, newPassword: string): Promise<AuthResponse>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse>;
    static refreshToken(user: IUser): Promise<AuthResponse>;
}
//# sourceMappingURL=AuthService.d.ts.map