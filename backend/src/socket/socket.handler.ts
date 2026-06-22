import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../server';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (io: Server) => {
  // Auth middleware for socket
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Join personal room
    if (socket.userId) socket.join(`user:${socket.userId}`);

    // ── JOIN CONVERSATION ────────────────────────────────────────────
    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── SEND MESSAGE ─────────────────────────────────────────────────
    socket.on('send:message', async (data: {
      conversationId: string;
      content?: string;
      imageUrl?: string;
    }) => {
      try {
        if (!socket.userId) return;

        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: socket.userId,
            content: data.content,
            imageUrl: data.imageUrl,
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        });

        // Update conversation last message
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            lastMessage: data.content || '📷 Image',
            lastMessageAt: new Date(),
          },
        });

        io.to(`conversation:${data.conversationId}`).emit('new:message', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── TYPING INDICATOR ─────────────────────────────────────────────
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId: socket.userId,
        conversationId,
      });
    });

    // ── MARK READ ────────────────────────────────────────────────────
    socket.on('messages:read', async (conversationId: string) => {
      if (!socket.userId) return;
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.userId },
          readAt: null,
        },
        data: { readAt: new Date() },
      });
      socket.to(`conversation:${conversationId}`).emit('messages:read', {
        conversationId,
        readBy: socket.userId,
      });
    });

    // ── ONLINE STATUS ────────────────────────────────────────────────
    socket.broadcast.emit('user:online', { userId: socket.userId });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });

  // Helper to emit notification to a user
  (io as any).notifyUser = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification', notification);
  };
};
