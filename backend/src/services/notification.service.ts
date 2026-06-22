import { prisma } from '../server';
import { io } from '../server';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  titleMyanmar?: string;
  message: string;
  messageMyanmar?: string;
  data?: Record<string, any>;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        titleMyanmar: params.titleMyanmar,
        message: params.message,
        messageMyanmar: params.messageMyanmar,
        data: params.data,
      },
    });

    // Emit real-time notification
    (io as any).notifyUser?.(params.userId, notification);

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

export const notifyNewOrder = async (sellerId: string, orderId: string, orderNumber: string) => {
  const seller = await prisma.seller.findUnique({ where: { id: sellerId }, include: { user: true } });
  if (!seller) return;
  await createNotification({
    userId: seller.user.id,
    type: 'NEW_ORDER',
    title: 'New Order Received!',
    titleMyanmar: 'အမှာစာသစ် လက်ခံရရှိသည်!',
    message: `Order ${orderNumber} has been placed.`,
    messageMyanmar: `အမှာစာ ${orderNumber} ထည့်သွင်းပြီးပါပြီ။`,
    data: { orderId, orderNumber },
  });
};

export const notifyPaymentVerified = async (buyerId: string, orderId: string, orderNumber: string) => {
  await createNotification({
    userId: buyerId,
    type: 'PAYMENT_VERIFIED',
    title: 'Payment Verified!',
    titleMyanmar: 'ငွေပေးချေမှု အတည်ပြုပြီး!',
    message: `Your payment for order ${orderNumber} has been verified.`,
    messageMyanmar: `အမှာစာ ${orderNumber} အတွက် ငွေပေးချေမှုကို အတည်ပြုပြီးပါပြီ။`,
    data: { orderId, orderNumber },
  });
};

export const notifyAccountSold = async (sellerId: string, accountTitle: string, orderId: string) => {
  const seller = await prisma.seller.findUnique({ where: { id: sellerId }, include: { user: true } });
  if (!seller) return;
  await createNotification({
    userId: seller.user.id,
    type: 'ACCOUNT_SOLD',
    title: 'Account Sold!',
    titleMyanmar: 'အကောင့် ရောင်းချပြီး!',
    message: `Your account "${accountTitle}" has been sold.`,
    messageMyanmar: `သင်၏ "${accountTitle}" အကောင့်ကို ရောင်းချပြီးပါပြီ။`,
    data: { orderId, accountTitle },
  });
};

export const notifyMessage = async (receiverId: string, senderName: string) => {
  await createNotification({
    userId: receiverId,
    type: 'MESSAGE_RECEIVED',
    title: 'New Message',
    titleMyanmar: 'မက်ဆေ့ချ် သစ်',
    message: `${senderName} sent you a message.`,
    messageMyanmar: `${senderName} မှ မက်ဆေ့ချ် ပို့ပါသည်။`,
    data: { senderName },
  });
};

interface NotifyUserParams {
  userId?: string;
  role?: 'ADMIN' | 'SELLER' | 'BUYER';
  type: NotificationType;
  title: string;
  titleMyanmar?: string;
  message: string;
  messageMyanmar?: string;
  data?: Record<string, any>;
}

export const notifyUser = async (params: NotifyUserParams) => {
  try {
    if (params.userId) {
      await createNotification({
        userId: params.userId,
        type: params.type,
        title: params.title,
        titleMyanmar: params.titleMyanmar,
        message: params.message,
        messageMyanmar: params.messageMyanmar,
        data: params.data,
      });
    } else if (params.role) {
      const users = await prisma.user.findMany({
        where: { role: params.role, isActive: true },
        select: { id: true },
      });
      for (const u of users) {
        await createNotification({
          userId: u.id,
          type: params.type,
          title: params.title,
          titleMyanmar: params.titleMyanmar,
          message: params.message,
          messageMyanmar: params.messageMyanmar,
          data: params.data,
        });
      }
    }
  } catch (err) {
    console.error('Failed to notify user(s):', err);
  }
};

