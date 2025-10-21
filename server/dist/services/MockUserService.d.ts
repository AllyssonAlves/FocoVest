declare class MockUserDatabase {
    private users;
    private idCounter;
    constructor();
    private generateAdditionalUsers;
    private initializeSampleUsers;
    findOne(query: any): Promise<any>;
    findById(id: string): Promise<any>;
    findByIdAndUpdate(id: string, update: any): Promise<any>;
    save(userData: any): Promise<any>;
    create(userData: any): Promise<any>;
    getAllUsers(): any[];
    getUserById(id: string): any | null;
    getAll(): Promise<any[]>;
    clear(): Promise<void>;
}
declare const MockUser: MockUserDatabase;
declare const mockUserDB: {
    create: (userData: any) => Promise<any>;
    findOne: (query: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByIdAndUpdate: (id: string, update: any) => Promise<any>;
    getAllUsers: () => any[];
    getUserById: (id: string) => any;
};
export { MockUser, mockUserDB, MockUserDatabase };
//# sourceMappingURL=MockUserService.d.ts.map