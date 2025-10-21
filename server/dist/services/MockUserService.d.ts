declare class MockUserDatabase {
    private users;
    private idCounter;
    constructor();
    private initializeSampleUsers;
    findOne(query: any): Promise<any>;
    findById(id: string): Promise<any>;
    findByIdAndUpdate(id: string, update: any): Promise<any>;
    save(userData: any): Promise<any>;
    create(userData: any): Promise<any>;
    getAll(): Promise<any[]>;
    clear(): Promise<void>;
}
declare const MockUser: MockUserDatabase;
declare const mockUserDB: {
    create: (userData: any) => Promise<any>;
    findOne: (query: any) => Promise<any>;
    findById: (id: string) => Promise<any>;
    findByIdAndUpdate: (id: string, update: any) => Promise<any>;
};
export { MockUser, mockUserDB };
//# sourceMappingURL=MockUserService.d.ts.map