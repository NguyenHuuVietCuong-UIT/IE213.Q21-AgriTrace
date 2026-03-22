require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batch');
const publicRoutes = require('./routes/public');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AgriTrace backend running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  let memoryServer;
  try {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (dbErr) {
      console.warn('Local MongoDB unavailable, starting in-memory MongoDB for development...');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri('agritrace');
      await mongoose.connect(memoryUri);
      console.log('MongoDB in-memory connected');
    }

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.error('Startup failure', err);
    process.exit(1);
  }
}

start();
