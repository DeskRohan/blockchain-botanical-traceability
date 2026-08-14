import express, { Request, Response } from 'express';
import cors from 'cors';
import { store } from './store.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', module: 'Module 1 — User & Herb Collection Management' });
});

// Auth Routes per PRD Spec
// POST /auth/register & POST /api/auth/register
const handleRegister = (req: Request, res: Response) => {
  try {
    const { name, email, role, phone } = req.body;

    if (!name || !email || !role || !phone) {
      return res.status(400).json({ error: 'Name, email, role, and phone are required fields.' });
    }

    if (role !== 'Farmer' && role !== 'Wild Collector') {
      return res.status(400).json({ error: 'Role must be either Farmer or Wild Collector.' });
    }

    const user = store.registerUser({ name, email, role, phone });
    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token: `mock-jwt-token-${user.userId}`,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
};

app.post('/api/auth/register', handleRegister);
app.post('/auth/register', handleRegister);

// POST /auth/login & POST /api/auth/login
const handleLogin = (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = store.getUserByEmail(email);

    // If user not found, auto-create demo user for smooth testing
    if (!user) {
      user = store.registerUser({
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: 'Farmer',
        phone: '+91 90000 00000',
      });
    }

    return res.json({
      message: 'Login successful',
      user,
      token: `mock-jwt-token-${user.userId}`,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Login failed' });
  }
};

app.post('/api/auth/login', handleLogin);
app.post('/auth/login', handleLogin);

// Batch Routes per PRD Spec
// POST /batches & POST /api/batches
const handleCreateBatch = (req: Request, res: Response) => {
  try {
    const { herbName, species, collectorId, collectionDate, latitude, longitude, imageUrl } = req.body;

    if (!herbName || !species || !collectorId || !collectionDate) {
      return res.status(400).json({
        error: 'herbName, species, collectorId, and collectionDate are required',
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'GPS latitude and longitude coordinates are required' });
    }

    const batch = store.createBatch({
      herbName,
      species,
      collectorId,
      collectionDate,
      latitude: Number(latitude),
      longitude: Number(longitude),
      imageUrl: imageUrl || '',
    });

    return res.status(201).json({
      message: 'Herb batch registered successfully',
      batch,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create batch' });
  }
};

app.post('/api/batches', handleCreateBatch);
app.post('/batches', handleCreateBatch);

// GET /batches/:batchId & GET /api/batches/:batchId
const handleGetBatchById = (req: Request, res: Response) => {
  const { batchId } = req.params;
  const batch = store.getBatchById(batchId);

  if (!batch) {
    return res.status(404).json({ error: `Batch with ID ${batchId} not found` });
  }

  return res.json({ batch });
};

app.get('/api/batches/:batchId', handleGetBatchById);
app.get('/batches/:batchId', handleGetBatchById);

// GET /batches/user/:userId & GET /api/batches/user/:userId
const handleGetBatchesByUser = (req: Request, res: Response) => {
  const { userId } = req.params;
  const batches = store.getBatchesByUserId(userId);
  return res.json({ batches });
};

app.get('/api/batches/user/:userId', handleGetBatchesByUser);
app.get('/batches/user/:userId', handleGetBatchesByUser);

// GET /api/batches — list all batches
app.get('/api/batches', (_req: Request, res: Response) => {
  const batches = store.getAllBatches();
  return res.json({ batches });
});

app.listen(PORT, () => {
  console.log(`[BotaniChain Server] Express API running on http://localhost:${PORT}`);
});
