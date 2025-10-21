import { ISimulation } from '../models/Simulation';
import { University } from '../../../shared/dist/types';
export interface SimulationFilters {
    category?: 'geral' | 'especifico' | 'revisao' | 'vestibular';
    subjects?: string[];
    universities?: University[];
    difficulty?: ('easy' | 'medium' | 'hard')[];
    status?: 'draft' | 'active' | 'completed' | 'paused';
    isPublic?: boolean;
    createdBy?: string;
    page?: number;
    limit?: number;
}
export interface SimulationResult {
    simulations: ISimulation[];
    currentPage: number;
    totalPages: number;
    totalSimulations: number;
    hasNext: boolean;
    hasPrev: boolean;
}
declare class MockSimulationService {
    private simulations;
    private nextId;
    constructor();
    private initializeMockData;
    private generateId;
    getSimulations(filters?: SimulationFilters): Promise<SimulationResult>;
    getSimulationById(id: string): Promise<any>;
    startSimulation(simulationId: string, userId: string): Promise<any>;
    submitAnswer(simulationId: string, userId: string, questionIndex: number, answer: string): Promise<any>;
    completeSimulation(simulationId: string, userId: string): Promise<any>;
    pauseSimulation(simulationId: string, userId: string): Promise<any>;
    resumeSimulation(simulationId: string, userId: string): Promise<any>;
    getSimulationStats(): Promise<any>;
    getUserSimulations(userId: string): Promise<any[]>;
    createSimulation(data: any): Promise<any>;
}
declare const mockSimulationService: MockSimulationService;
export { mockSimulationService, MockSimulationService };
//# sourceMappingURL=MockSimulationService.d.ts.map