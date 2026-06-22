import { Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int } from '../utils/helpers.utils';
import { uploadImage } from '../services/cloudinary.service';

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const seller = await prisma.seller.findUnique({ where: { userId } });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          ...(seller ? [{ sellerId: seller.id }] : []),
        ],
      },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: {
          select: {
            id: true, shopName: true, avatar: true,
            user: { select: { name: true, avatar: true } },
          },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return successResponse(res, conversations, 'Conversations fetched');
  } catch (err) {
    next(err);
  }
};

export const getConversationMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const page  = int(req.query.page)  ?? 1;
    const limit = int(req.query.limit) ?? 20;
    const skip  = (page - 1) * limit;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new ApiError(404, 'Conversation not found');

    const isAdmin  = req.user!.role === 'ADMIN';
    const isBuyer  = conversation.buyerId === req.user!.id;

    // Check if current user is the seller in this conversation
    const sellerRecord = await prisma.seller.findUnique({ where: { id: conversation.sellerId } });
    const isSeller = sellerRecord?.userId === req.user!.id;

    if (!isAdmin && !isBuyer && !isSeller) throw new ApiError(403, 'No permission to access these messages');

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark incoming messages as read asynchronously
    prisma.message.updateMany({
      where: { conversationId, senderId: { not: req.user!.id }, readAt: null },
      data: { readAt: new Date() },
    }).catch(console.error);

    return successResponse(res, {
      messages: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, 'Messages fetched');
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const content        = str(req.body.content);
    const receiverId     = str(req.body.receiverId);
    const conversationId = str(req.body.conversationId);
    const senderId       = req.user!.id;
    const file           = req.file;

    if (!content && !file) throw new ApiError(400, 'Message content or image attachment is required');

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      if (!receiverId) throw new ApiError(400, 'Receiver ID or Conversation ID is required');

      // Determine buyer/seller roles
      const receiverSeller = await prisma.seller.findUnique({ where: { id: receiverId } });
      const senderSeller   = await prisma.seller.findUnique({ where: { userId: senderId } });
      const altSeller      = await prisma.seller.findFirst({ where: { userId: receiverId } });

      let buyerId: string;
      let sellerId: string;

      if (receiverSeller) {
        buyerId = senderId; sellerId = receiverSeller.id;
      } else if (senderSeller) {
        buyerId = receiverId; sellerId = senderSeller.id;
      } else if (altSeller) {
        buyerId = senderId; sellerId = altSeller.id;
      } else {
        throw new ApiError(400, 'Invalid participant roles');
      }

      let conversation = await prisma.conversation.findUnique({
        where: { buyerId_sellerId: { buyerId, sellerId } },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({ data: { buyerId, sellerId } });
      }
      activeConversationId = conversation.id;
    }

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (file) {
      const result = await uploadImage(file.buffer, 'chat');
      imageUrl = result.url;
      imagePublicId = result.publicId;
    }

    const messageContent = content ?? 'Sent an image';

    const message = await prisma.$transaction(async (tx) => {
      const newMsg = await tx.message.create({
        data: { conversationId: activeConversationId!, senderId, content, imageUrl, imagePublicId },
      });
      await tx.conversation.update({
        where: { id: activeConversationId! },
        data: { lastMessage: messageContent, lastMessageAt: new Date() },
      });
      return newMsg;
    });

    return successResponse(res, message, 'Message sent successfully', 201);
  } catch (err) {
    next(err);
  }
};
