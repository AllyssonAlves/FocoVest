import mongoose, { Document } from 'mongoose';
export interface IAlternative {
    letter: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    isCorrect: boolean;
}
export interface IQuestion extends Document {
    title: string;
    statement: string;
    alternatives: IAlternative[];
    explanation: string;
    subject: string;
    university: string;
    examYear: number;
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
}
declare const _default: mongoose.Model<IQuestion, {}, {}, {}, mongoose.Document<unknown, {}, IQuestion, {}, {}> & IQuestion & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Question.d.ts.map