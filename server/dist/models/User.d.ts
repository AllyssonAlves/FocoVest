import mongoose, { Document } from 'mongoose';
import { University, UserRole } from '../../../shared/dist/types';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    university?: University;
    course?: string;
    graduationYear?: number;
    role: UserRole;
    level: number;
    experience: number;
    achievements: mongoose.Types.ObjectId[];
    statistics: {
        totalSimulations: number;
        totalQuestions: number;
        correctAnswers: number;
        averageScore: number;
        timeSpent: number;
        streakDays: number;
        lastSimulationDate?: Date;
    };
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateEmailVerificationToken(): string;
    generatePasswordResetToken(): string;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map