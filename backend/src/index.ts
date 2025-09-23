import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prism';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Routes
app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Prism Backend!',
    status: 'running',
    version: '1.0.0',
    features: {
      tasks: 'Task management and tracking',
      team: 'Team collaboration and status',
      conflicts: 'AI-powered conflict detection',
      chat: 'Real-time team communication'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Prism server running on port ${PORT}`);
  console.log(`📱 VS Code Extension can connect to: http://localhost:${PORT}`);
  console.log(`🌐 Dashboard available at: http://localhost:5173 (if frontend is running)`);
});
