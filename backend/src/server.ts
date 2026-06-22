import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config';
import { initializeSocket } from './socket/socket.handler';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: [config.frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
});

// Initialize Socket.io handlers
initializeSocket(io);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    httpServer.listen(config.port, () => {
      console.log(`🚀 PanneiStore API running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📡 Socket.io ready`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    console.warn('⚠️ Starting server without database connection. API endpoints will fail until DB is available.');
    // Start HTTP server anyway for dev/demo purposes
    httpServer.listen(config.port, () => {
      console.log(`🚀 PanneiStore API running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📡 Socket.io ready`);
    });
  }
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

startServer();
