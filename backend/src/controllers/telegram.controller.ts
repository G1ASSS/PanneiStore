import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { config } from '../config';
import cloudinary from '../services/cloudinary.service';
import { getTelegramFileUrl, sendMessageToChannel } from '../services/telegram.service';

/**
 * Handle incoming webhook updates from Telegram
 */
export const handleWebhook = async (req: Request, res: Response) => {
  // Always return 200 to Telegram so it doesn't retry
  res.status(200).send('OK');

  try {
    const update = req.body;
    
    // We only care about messages
    if (!update || !update.message) return;

    const message = update.message;
    const chatId = message.chat.id.toString();
    const senderId = message.from?.id?.toString();
    const text = message.text || message.caption || '';
    
    // ─── 1. Admin Commands (/banner, /stock) ───
    if (config.telegram.adminIds.includes(senderId) && text.startsWith('/')) {
      await handleAdminCommand(text, senderId);
      return;
    }

    // ─── 2. Auto-List New Accounts (#NEW_ACCOUNT) ───
    if (config.telegram.adminIds.includes(senderId) && text.includes('#NEW_ACCOUNT')) {
      await handleAutoListing(message, senderId);
      return;
    }

  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
  }
};

const handleAdminCommand = async (text: string, senderId: string) => {
  const parts = text.split(' ');
  const command = parts[0];
  
  try {
    if (command === '/banner') {
      const bannerText = parts.slice(1).join(' ');
      if (!bannerText) {
        await sendMessageToChannel('❌ Usage: /banner <text>', senderId);
        return;
      }
      
      // Update or create the first HOME_HERO banner
      const existing = await prisma.banner.findFirst({ where: { position: 'HOME_HERO' } });
      if (existing) {
        await prisma.banner.update({
          where: { id: existing.id },
          data: { title: bannerText, isActive: true }
        });
      } else {
        await prisma.banner.create({
          data: {
            title: bannerText,
            imageUrl: '',
            position: 'HOME_HERO',
            isActive: true
          }
        });
      }
      await sendMessageToChannel('✅ Banner updated successfully on the website!', senderId);
    } 
    
    else if (command === '/stock' && parts[1] === 'out') {
      const listingCode = parts[2];
      if (!listingCode) {
        await sendMessageToChannel('❌ Usage: /stock out <listingCode>', senderId);
        return;
      }
      
      const account = await prisma.account.findUnique({ where: { listingCode } });
      if (!account) {
        await sendMessageToChannel(`❌ Account ${listingCode} not found.`, senderId);
        return;
      }
      
      await prisma.account.update({
        where: { id: account.id },
        data: { status: 'SOLD' }
      });
      await sendMessageToChannel(`✅ Account ${listingCode} marked as SOLD.`, senderId);
    }
  } catch (err: any) {
    await sendMessageToChannel(`❌ Command failed: ${err.message}`, senderId);
  }
};

const handleAutoListing = async (message: any, senderId: string) => {
  const text = message.caption || message.text || '';
  
  // Try to find a seller for this admin, fallback to first seller if any
  let seller = await prisma.seller.findFirst();
  if (!seller) {
    await sendMessageToChannel('❌ Cannot auto-list: No seller profile found in the database.', senderId);
    return;
  }

  // Very basic regex parsing for: "Mythic Glory, 150 Skins, Price: 30000 MMK"
  const rankMatch = text.match(/([^,]+)/);
  const skinMatch = text.match(/(\d+)\s+Skins/i);
  const priceMatch = text.match(/Price:\s*(\d+)/i);
  
  const rank = rankMatch ? rankMatch[1].trim() : 'Unknown Rank';
  const skinCount = skinMatch ? parseInt(skinMatch[1]) : 0;
  const price = priceMatch ? parseInt(priceMatch[1]) : 0;

  try {
    const listingCode = `TG-${Date.now().toString().slice(-6)}`;
    
    // Create the account
    const account = await prisma.account.create({
      data: {
        listingCode,
        sellerId: seller.id,
        title: `[Auto] ${rank} with ${skinCount} Skins`,
        rank: rank,
        skinCount: skinCount,
        heroCount: 0,
        price: price,
        server: 'Global',
        winRate: 50.0,
        totalMatches: 0,
        status: 'AVAILABLE',
      }
    });

    // Handle image if present
    if (message.photo && message.photo.length > 0) {
      // Get highest resolution photo
      const photo = message.photo[message.photo.length - 1];
      const fileUrl = await getTelegramFileUrl(photo.file_id);
      
      if (fileUrl) {
        // Upload to cloudinary
        try {
          const uploadRes = await cloudinary.uploader.upload(fileUrl, {
            folder: 'panneistore/accounts',
          });
          
          await prisma.accountImage.create({
            data: {
              accountId: account.id,
              url: uploadRes.secure_url,
              publicId: uploadRes.public_id,
              isPrimary: true
            }
          });
        } catch (imgErr) {
          console.error('Failed to upload Telegram image to Cloudinary', imgErr);
        }
      }
    }

    await sendMessageToChannel(`✅ Successfully listed on Website!\nListing Code: ${listingCode}\nPrice: ${price} MMK`, senderId);
  } catch (err: any) {
    await sendMessageToChannel(`❌ Failed to list account: ${err.message}`, senderId);
  }
};
