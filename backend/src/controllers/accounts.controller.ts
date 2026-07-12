import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int, flt, bool } from '../utils/helpers.utils';
import { uploadImage, deleteImage } from '../services/cloudinary.service';
import { AccountStatus, Prisma } from '@prisma/client';
import { config } from '../config';
import { sendMediaGroupToChat, sendMessageToChannel } from '../services/telegram.service';

export const listAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page      = int(req.query.page)    ?? 1;
    const limit     = int(req.query.limit)   ?? 12;
    const search    = str(req.query.search);
    const rank      = str(req.query.rank);
    const server    = str(req.query.server);
    const minPrice  = flt(req.query.minPrice);
    const maxPrice  = flt(req.query.maxPrice);
    const minHeroCount = int(req.query.minHeroCount);
    const minSkinCount = int(req.query.minSkinCount);
    const sellerId  = str(req.query.sellerId);
    const statusQ   = str(req.query.status) ?? 'AVAILABLE';
    const sortBy    = str(req.query.sortBy)    ?? 'createdAt';
    const sortOrder = str(req.query.sortOrder) ?? 'desc';
    const isFeaturedQ = str(req.query.isFeatured);

    const skip = (page - 1) * limit;

    const where: Prisma.AccountWhereInput = {};
    if (statusQ && statusQ !== 'ALL') where.status = statusQ as AccountStatus;
    if (sellerId) where.sellerId = sellerId;
    if (rank) {
      // Extract the key tier keyword from the filter value for a fuzzy match.
      // e.g. "Universe/Galaxy Collector" → search for "Universe" OR "Galaxy"
      // e.g. "Mega Collector" → search for "Mega"
      const tierKeywords = rank
        .replace(' Collector', '')
        .split('/')
        .map((k: string) => k.trim())
        .filter(Boolean);

      where.OR = [
        ...tierKeywords.map((kw: string) => ({ rank: { contains: kw, mode: 'insensitive' as const } })),
        ...tierKeywords.map((kw: string) => ({ title: { contains: kw, mode: 'insensitive' as const } })),
        ...tierKeywords.map((kw: string) => ({ description: { contains: kw, mode: 'insensitive' as const } })),
      ];
    }
    if (server) where.server = server;
    if (isFeaturedQ !== undefined) where.isFeatured = isFeaturedQ === 'true';
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (minHeroCount !== undefined) where.heroCount = { gte: minHeroCount };
    if (minSkinCount !== undefined) where.skinCount = { gte: minSkinCount };
    if (search) {
      const searchOR = [
        { listingCode: { contains: search } },
        { title: { contains: search } },
        { titleMyanmar: { contains: search } },
        { description: { contains: search } },
        { descMyanmar: { contains: search } },
      ];
      if (where.OR) {
        // Both rank filter and search are active — combine with AND
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          seller: { select: { id: true, shopName: true, isApproved: true, rating: true, avatar: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.account.count({ where }),
    ]);

    return successResponse(res, {
      accounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, 'Accounts fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getAvailableAccountsCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusQ = str(req.query.status) ?? 'AVAILABLE';
    const where: Prisma.AccountWhereInput = {};
    if (statusQ) where.status = statusQ as AccountStatus;

    const total = await prisma.account.count({ where });
    return successResponse(res, { total }, 'Available accounts count fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getAccountDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        OR: [{ id }, { listingCode: id }],
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        heroes: true,
        skins: true,
        seller: {
          select: {
            id: true,
            shopName: true,
            shopNameMyanmar: true,
            isApproved: true,
            rating: true,
            avatar: true,
            createdAt: true,
            user: { select: { name: true, createdAt: true } },
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { buyer: { select: { name: true, avatar: true } } },
        },
      },
    });

    if (!account) throw new ApiError(404, 'Account not found');

    prisma.account.update({ where: { id: account.id }, data: { viewCount: { increment: 1 } } }).catch(console.error);

    return successResponse(res, account, 'Account details fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const createAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    
    if (!seller && req.user!.role === 'ADMIN') {
      seller = await prisma.seller.create({
        data: {
          userId: req.user!.id,
          shopName: 'Pannei Store Admin',
          isApproved: true,
        }
      });
    }

    if (!seller) throw new ApiError(403, 'Only registered sellers can create listings');
    if (!seller.isApproved && req.user!.role !== 'ADMIN') throw new ApiError(403, 'Your seller account is pending admin approval');

    const {
      title, titleMyanmar, description, descMyanmar,
      rank, server, heroes = [], skins = [],
    } = req.body;

    const heroCount    = int(req.body.heroCount)   ?? 0;
    const skinCount    = int(req.body.skinCount)   ?? 0;
    const emblemCount  = int(req.body.emblemCount) ?? 0;
    const price        = flt(req.body.price)       ?? 0;
    const winRate      = flt(req.body.winRate)     ?? 0;
    const totalMatches = int(req.body.totalMatches) ?? 0;
    const level        = int(req.body.level)       ?? 0;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new ApiError(400, 'At least one account image is required');

    const uploadedImages: { url: string; publicId: string; isPrimary: boolean; order: number }[] = [];
    for (let i = 0; i < files.length; i++) {
      const result = await uploadImage(files[i].buffer, 'accounts');
      uploadedImages.push({ url: result.url, publicId: result.publicId, isPrimary: i === 0, order: i });
    }

    const heroList = typeof heroes === 'string' ? JSON.parse(heroes) : heroes;
    const skinList = typeof skins  === 'string' ? JSON.parse(skins)  : skins;

    const account = await prisma.account.create({
      data: {
        sellerId: seller.id,
        title, titleMyanmar, description, descMyanmar,
        rank, heroCount, skinCount, emblemCount,
        price: new Prisma.Decimal(price),
        server, winRate, totalMatches, level,
        status: 'AVAILABLE',
        images: { create: uploadedImages },
        heroes: { create: heroList },
        skins: { create: skinList },
      },
      include: { images: true, heroes: true, skins: true },
    });

    return successResponse(res, account, 'Account listing created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const account = await prisma.account.findUnique({ include: { seller: true }, where: { id } });
    if (!account) throw new ApiError(404, 'Account not found');

    const isAdmin = req.user!.role === 'ADMIN';
    const isOwner = account.seller.userId === req.user!.id;
    if (!isAdmin && !isOwner) throw new ApiError(403, 'You do not have permission to update this listing');

    const { title, titleMyanmar, description, descMyanmar, rank, server, status, heroes, skins, listingCode } = req.body;
    const heroCount    = int(req.body.heroCount);
    const skinCount    = int(req.body.skinCount);
    const emblemCount  = int(req.body.emblemCount);
    const price        = flt(req.body.price);
    const winRate      = flt(req.body.winRate);
    const totalMatches = int(req.body.totalMatches);
    const level        = int(req.body.level);
    const isFeatured   = req.body.isFeatured;

    const updateData: Prisma.AccountUpdateInput = {};
    if (title !== undefined) updateData.title = title;
    if (titleMyanmar !== undefined) updateData.titleMyanmar = titleMyanmar;
    if (description !== undefined) updateData.description = description;
    if (descMyanmar !== undefined) updateData.descMyanmar = descMyanmar;
    if (rank !== undefined) updateData.rank = rank;
    if (heroCount !== undefined) updateData.heroCount = heroCount;
    if (skinCount !== undefined) updateData.skinCount = skinCount;
    if (emblemCount !== undefined) updateData.emblemCount = emblemCount;
    if (price !== undefined) updateData.price = new Prisma.Decimal(price);
    if (server !== undefined) updateData.server = server;
    if (winRate !== undefined) updateData.winRate = winRate;
    if (totalMatches !== undefined) updateData.totalMatches = totalMatches;
    if (level !== undefined) updateData.level = level;
    if (status !== undefined) updateData.status = status as AccountStatus;
    if (listingCode !== undefined && isAdmin) {
      const code = str(listingCode)?.trim() || null;
      if (code) {
        const existing = await prisma.account.findFirst({
          where: { listingCode: code, NOT: { id } },
        });
        if (existing) throw new ApiError(409, 'Listing ID is already in use');
      }
      updateData.listingCode = code;
    }
    if (isFeatured !== undefined && isAdmin) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;

    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const existingCount = await prisma.accountImage.count({ where: { accountId: id } });
      const uploadedImages: { url: string; publicId: string; isPrimary: boolean; order: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadImage(files[i].buffer, 'accounts');
        uploadedImages.push({
          url: result.url,
          publicId: result.publicId,
          isPrimary: existingCount === 0 && i === 0,
          order: existingCount + i,
        });
      }
      updateData.images = { create: uploadedImages };
    }

    const updatedAccount = await prisma.$transaction(async (tx) => {
      if (heroes !== undefined) {
        await tx.accountHero.deleteMany({ where: { accountId: id } });
        const heroList = typeof heroes === 'string' ? JSON.parse(heroes) : heroes;
        updateData.heroes = { create: heroList };
      }
      if (skins !== undefined) {
        await tx.accountSkin.deleteMany({ where: { accountId: id } });
        const skinList = typeof skins === 'string' ? JSON.parse(skins) : skins;
        updateData.skins = { create: skinList };
      }
      return tx.account.update({
        where: { id },
        data: updateData,
        include: { images: { orderBy: { order: 'asc' } }, heroes: true, skins: true },
      });
    });

    return successResponse(res, updatedAccount, 'Account updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const account = await prisma.account.findUnique({ include: { seller: true, images: true }, where: { id } });
    if (!account) throw new ApiError(404, 'Account not found');

    const isAdmin = req.user!.role === 'ADMIN';
    const isOwner = account.seller.userId === req.user!.id;
    if (!isAdmin && !isOwner) throw new ApiError(403, 'You do not have permission to delete this listing');

    // Clean up Cloudinary images
    for (const image of account.images) {
      await deleteImage(image.publicId).catch(console.error);
    }

    // Use a transaction to nullify references and then delete
    await prisma.$transaction(async (tx) => {
      // Nullify account references in order items and reviews (they are optional FKs)
      await tx.orderItem.updateMany({ where: { accountId: id }, data: { accountId: null } });
      await tx.review.updateMany({ where: { accountId: id }, data: { accountId: null } });
      // Delete wishlist and cart items referencing this account
      await tx.wishlistItem.deleteMany({ where: { accountId: id } });
      await tx.cartItem.deleteMany({ where: { accountId: id } });
      // Delete the account (cascades to images, heroes, skins)
      await tx.account.delete({ where: { id } });
    });

    return successResponse(res, null, 'Account deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const buyRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        OR: [{ id }, { listingCode: id }],
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!account) throw new ApiError(404, 'Account not found');

    const adminChatId = config.telegram.adminIds[0];
    if (!adminChatId) {
      throw new ApiError(500, 'Telegram Admin Chat ID is not configured on the server');
    }

    // 1. Send the album (Media Group)
    if (account.images.length > 0) {
      const media = account.images.map((img) => ({
        type: 'photo',
        media: img.url,
      }));
      await sendMediaGroupToChat(media, adminChatId);
    }

    // 2. Send the text message
    const formattedPrice = new Intl.NumberFormat('en-US').format(Number(account.price));
    const listingIdStr = account.listingCode ? account.listingCode : account.id;
    const accountUrl = `${process.env.FRONTEND_URL || 'https://panneistore.vercel.app'}/market/${account.id}`;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    const buyerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const text = `🛒 <b>New Purchase Request</b>

<b>Title:</b>
${account.title}

<b>Listing ID:</b>
${listingIdStr}

<b>Price:</b>
${formattedPrice} MMK

<b>Time:</b>
${timestamp}

<b>Buyer IP:</b>
${buyerIp}

<b>Browser:</b>
${userAgent}

<b>Account URL:</b>
${accountUrl}`;

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '🌐 View Listing',
            url: accountUrl,
          },
        ],
      ],
    };

    await sendMessageToChannel(text, adminChatId, replyMarkup);

    return successResponse(res, null, 'Purchase request sent successfully');
  } catch (err) {
    next(err);
  }
};
