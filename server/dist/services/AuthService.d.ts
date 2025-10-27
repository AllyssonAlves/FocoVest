import { IUser } from '../models/User';
import { University } from '../../../shared/dist/types';
import { DeviceInfo } from './SessionService';
import { Request } from 'express';
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
    rememberMe?: boolean;
    deviceInfo?: Partial<DeviceInfo>;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: Partial<IUser>;
        token: string;
        refreshToken?: string;
        expiresIn?: number;
    };
}
export declare class AuthService {
    static register(data: RegisterData): Promise<AuthResponse>;
    static login(data: LoginData, req?: Request): Promise<AuthResponse>;
    static verifyEmail(token: string): Promise<AuthResponse>;
    static forgotPassword(email: string): Promise<AuthResponse>;
    static resetPassword(token: string, newPassword: string): Promise<AuthResponse>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse>;
    static refreshToken(user: IUser, oldToken?: string): Promise<AuthResponse>;
    static logout(token: string, refreshToken?: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static logoutAllDevices(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static getUserSessions(userId: string): Promise<{
        success: boolean;
        data?: {
            activeSessions: any[];
            stats: {
                activeSessions: number;
                totalDevices: number;
                lastActivity: Date | null;
            };
        };
    }>;
    static validateRefreshToken(refreshToken: string): Promise<IUser | null>;
    private static generateRefreshToken;
    static securityLogout(userId: string, reason?: string): Promise<void>;
}
//# sourceMappingURL=AuthService.d.ts.map