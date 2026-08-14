import { firebaseService } from './firebaseService.js';
import {
  User,
  HerbBatch,
  RegisterDTO,
  LoginDTO,
  CreateBatchDTO,
  AuthResponse,
} from '../types/index.js';

export const apiService = {
  // Authentication APIs using Live Firebase Auth & Firestore
  async register(data: RegisterDTO): Promise<AuthResponse> {
    return await firebaseService.register(data);
  },

  async login(data: LoginDTO): Promise<AuthResponse> {
    return await firebaseService.login(data);
  },

  // Herb Batch APIs using Live Firestore ONLY
  async createBatch(data: CreateBatchDTO): Promise<{ batch: HerbBatch }> {
    return await firebaseService.createBatch(data);
  },

  async getBatchById(batchId: string): Promise<{ batch: HerbBatch }> {
    return await firebaseService.getBatchById(batchId);
  },

  async getBatchesByUserId(userId: string): Promise<{ batches: HerbBatch[] }> {
    return await firebaseService.getBatchesByUserId(userId);
  },

  async getAllBatches(): Promise<{ batches: HerbBatch[] }> {
    return await firebaseService.getAllBatches();
  },
};
