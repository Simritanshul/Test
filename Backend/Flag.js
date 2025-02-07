import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import winston from 'winston';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { exec } from 'child_process';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const redisClient = createClient({
    url: process.env.REDIS_URL  // Use the Redis URL from .env
  });
  
  redisClient.on('error', (err) => console.error('Redis Error:', err));
  
  (async () => {
    try {
      await redisClient.connect(); // Connect asynchronously to Redis
      console.log('Redis connected');
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }
  })();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const featureFlagSchema = new mongoose.Schema({
  featureName: String,
  environments: Object,
  users: Object,
  updatedBy: String,
  updatedAt: { type: Date, default: Date.now },
});

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// Get feature flag for user
app.get('/feature-flags/:featureName/:userId', async (req, res) => {
  const { featureName, userId } = req.params;
  const cacheKey = `feature:${featureName}:user:${userId}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return res.json(JSON.parse(cachedData));

    const flag = await FeatureFlag.findOne({ featureName });
    if (!flag) return res.status(404).json({ error: 'Feature flag not found' });

    const userFlag = flag.users[userId] || flag.environments.production;
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(userFlag)); // Set cache with expiration
    res.json(userFlag);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update a feature flag
app.post('/feature-flags/:featureName', async (req, res) => {
  const { featureName } = req.params;
  const { environments, users, updatedBy } = req.body;

  try {
    const flag = await FeatureFlag.findOneAndUpdate(
      { featureName },
      { environments, users, updatedBy, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    await redisClient.del(`feature:${featureName}:*`);
    logger.info(`Feature flag updated: ${featureName} by ${updatedBy}`);
    res.json(flag);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List all feature flags
app.get('/feature-flags', async (req, res) => {
  try {
    const flags = await FeatureFlag.find();
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle a feature flag
app.put('/feature-flags/:featureName/toggle', async (req, res) => {
  const { featureName } = req.params;
  const { environment, updatedBy } = req.body;

  try {
    const flag = await FeatureFlag.findOne({ featureName });
    if (!flag) return res.status(404).json({ error: 'Feature flag not found' });

    flag.environments[environment].enabled = !flag.environments[environment].enabled;
    flag.updatedBy = updatedBy;
    flag.updatedAt = new Date();
    await flag.save();

    await redisClient.del(`feature:${featureName}:*`);
    logger.info(`Feature flag toggled: ${featureName} by ${updatedBy}`);
    res.json(flag);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Unit test command
app.get('/run-tests', (req, res) => {
  exec('npm test', (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ output: stdout || stderr });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
