export declare const config: {
    mongodb: {
        uri: string;
        options: {
            useNewUrlParser: boolean;
            useUnifiedTopology: boolean;
        };
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    server: {
        port: number;
        env: string;
    };
};
export declare const connectDB: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map