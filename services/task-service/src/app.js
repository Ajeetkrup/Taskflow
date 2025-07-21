const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const { connectDB } = require('./utils/database');
const { connectRedis } = require('./utils/redis');
const { register, metricsMiddleware, tasksTotal } = require('./utils/metrics');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// metrics middleware
app.use(metricsMiddleware);

// metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
});

// Routes
app.use('/api/tasks', taskRoutes);

app.use((req, res, next) => {
  if (req.path.includes('/api/tasks') && req.method === 'POST') {
    tasksTotal.labels('created', res.statusCode < 400 ? 'success' : 'error').inc();
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'task-service', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`Task service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
