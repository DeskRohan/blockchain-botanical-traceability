import { User, HerbBatch, RegisterDTO, CreateBatchDTO } from '../src/types/index.js';

class DataStore {
  private users: Map<string, User> = new Map();
  private batches: Map<string, HerbBatch> = new Map();

  constructor() {
    // Clean empty store
  }

  // User methods
  public registerUser(dto: RegisterDTO): User {
    const existing = this.users.get(dto.email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const user: User = {
      userId,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      phone: dto.phone,
    };

    this.users.set(userId, user);
    this.users.set(user.email.toLowerCase(), user);
    return user;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.get(email.toLowerCase());
  }

  public getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  // Batch methods
  public createBatch(dto: CreateBatchDTO): HerbBatch {
    const collector = this.getUserById(dto.collectorId);
    
    // Generate unique batch ID as per PRD requirement
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const batchId = `BTC-${new Date().getFullYear()}-${randomSuffix}`;

    const newBatch: HerbBatch = {
      batchId,
      herbName: dto.herbName,
      species: dto.species,
      collectorId: dto.collectorId,
      collectorName: collector ? collector.name : 'Unknown Collector',
      collectorRole: collector ? collector.role : 'Farmer',
      collectionDate: dto.collectionDate,
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      status: 'COLLECTED',
      createdAt: new Date().toISOString(),
    };

    this.batches.set(batchId, newBatch);
    return newBatch;
  }

  public getBatchById(batchId: string): HerbBatch | undefined {
    return this.batches.get(batchId);
  }

  public getBatchesByUserId(userId: string): HerbBatch[] {
    const all = Array.from(this.batches.values());
    return all.filter((b) => b.collectorId === userId);
  }

  public getAllBatches(): HerbBatch[] {
    return Array.from(this.batches.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const store = new DataStore();
