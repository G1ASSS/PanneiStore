import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../server';
import { config } from '../config';
import { getTelegramFileUrl, sendMessageToChannel } from '../services/telegram.service';
import { uploadImage } from '../services/cloudinary.service';

/**
 * Handle incoming webhook updates from Telegram
 */
export const handleWebhook = async (req: Request, res: Response) => {
  // Always return 200 immediately so Telegram doesn't retry
  res.status(200).send('OK');

  try {
    const update = req.body;
    if (!update || !update.message) return;

    const message = update.message;
    const senderId = message.from?.id?.toString();
    const text = (message.caption || message.text || '').trim();
    const mediaGroupId: string | undefined = message.media_group_id?.toString();

    console.log('--- TELEGRAM WEBHOOK RECEIVED ---');
    console.log('Sender ID:', senderId);
    console.log('Admin IDs:', config.telegram.adminIds);
    console.log('Is Admin?', config.telegram.adminIds.includes(senderId));
    console.log('Text:', text);
    console.log('Media Group ID:', mediaGroupId);
    console.log('Has Photo?', !!(message.photo && message.photo.length > 0));

    // Only process if sender is admin
    if (!config.telegram.adminIds.includes(senderId)) return;

    // ─── 1. Admin Commands (/banner, /stock, /sold, /delete, /addphoto) ───
    if (text.startsWith('/banner') || text.startsWith('/stock') || text.startsWith('/sold') || text.startsWith('/delete')) {
      await handleAdminCommand(text, senderId);
      return;
    }

    // ─── 2. /addphoto <listingCode> — add more photos to an existing listing ───
    if (text.startsWith('/addphoto') && message.photo) {
      const listingCode = text.split(' ')[1]?.trim();
      if (listingCode) {
        await handleAddPhotos(message, senderId, listingCode, mediaGroupId);
      } else {
        await sendMessageToChannel('❌ Usage: /addphoto <listingCode>', senderId);
      }
      return;
    }

    // ─── 3. Auto-List New Accounts (#NEW_ACCOUNT or structured format) ───
    const isAutoList = text.includes('#NEW_ACCOUNT') || text.includes('Listing ID') || text.includes('Title');
    if (isAutoList) {
      await handleAutoListing(message, senderId, mediaGroupId);
      return;
    }

    // Handle follow-up photos from a media group (same group, no text)
    if (mediaGroupId && !text && message.photo && message.photo.length > 0) {
      await handleGroupPhoto(message, mediaGroupId, senderId);
      return;
    }

  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
  }
};

// ─── Admin Commands ────────────────────────────────────────────────────────────
const handleAdminCommand = async (text: string, senderId: string) => {
  const parts = text.trim().split(/\s+/);
  const command = parts[0];

  try {
    if (command === '/banner') {
      const bannerText = parts.slice(1).join(' ');
      if (!bannerText) {
        await sendMessageToChannel('❌ Usage: /banner <text>', senderId);
        return;
      }
      await sendMessageToChannel(`📢 <b>ANNOUNCEMENT</b>\n${bannerText}`, senderId);

    } else if (command === '/stock') {
      const count = await prisma.account.count({ where: { status: 'AVAILABLE' } });
      await sendMessageToChannel(`📦 Current stock: <b>${count}</b> accounts available.`, senderId);

    } else if (command === '/sold') {
      const listingCode = parts[1];
      if (!listingCode) {
        await sendMessageToChannel('❌ Usage: /sold <listingCode>', senderId);
        return;
      }
      const account = await prisma.account.findUnique({ where: { listingCode } });
      if (!account) {
        await sendMessageToChannel(`❌ Listing <b>${listingCode}</b> not found.`, senderId);
        return;
      }
      await prisma.account.update({ where: { listingCode }, data: { status: 'SOLD' } });
      await sendMessageToChannel(`✅ Account ${listingCode} marked as SOLD.`, senderId);

    } else if (command === '/delete') {
      const listingCode = parts[1];
      if (!listingCode) {
        await sendMessageToChannel('❌ Usage: /delete <listingCode>', senderId);
        return;
      }
      const account = await prisma.account.findUnique({ where: { listingCode } });
      if (!account) {
        await sendMessageToChannel(`❌ Listing <b>${listingCode}</b> not found.`, senderId);
        return;
      }
      // Delete related images first to avoid foreign key constraint errors
      await prisma.accountImage.deleteMany({ where: { accountId: account.id } });
      await prisma.account.delete({ where: { id: account.id } });
      await sendMessageToChannel(`🗑️ Account <b>${listingCode}</b> has been permanently deleted.`, senderId);
    }
  } catch (err: any) {
    const safeMsg = (err.message || 'Unknown error').replace(/<[^>]*>?/gm, '');
    await sendMessageToChannel(`❌ Command failed:\n<pre>${safeMsg.substring(0, 500)}</pre>`, senderId);
  }
};

// ─── Add Photos to Existing Listing ──────────────────────────────────────────
const addPhotoPending = new Map<string, { listingCode: string; senderId: string; photos: any[][]; timer: ReturnType<typeof setTimeout> }>();

const handleAddPhotos = async (message: any, senderId: string, listingCode: string, mediaGroupId?: string) => {
  if (mediaGroupId) {
    if (addPhotoPending.has(mediaGroupId)) {
      const group = addPhotoPending.get(mediaGroupId)!;
      if (message.photo) group.photos.push(message.photo);
      clearTimeout(group.timer);
      group.timer = setTimeout(async () => {
        const g = addPhotoPending.get(mediaGroupId);
        if (!g) return;
        addPhotoPending.delete(mediaGroupId);
        await processAddPhotoBatch(g.listingCode, g.senderId, g.photos);
      }, 3000);
    } else {
      const group = {
        listingCode,
        senderId,
        photos: message.photo ? [message.photo] : [],
        timer: setTimeout(async () => {
          const g = addPhotoPending.get(mediaGroupId!);
          if (!g) return;
          addPhotoPending.delete(mediaGroupId!);
          await processAddPhotoBatch(g.listingCode, g.senderId, g.photos);
        }, 3000),
      };
      addPhotoPending.set(mediaGroupId, group);
    }
  } else {
    await processAddPhotoBatch(listingCode, senderId, message.photo ? [message.photo] : []);
  }
};

const processAddPhotoBatch = async (listingCode: string, senderId: string, photoGroups: any[][]) => {
  const account = await prisma.account.findUnique({ where: { listingCode } });
  if (!account) {
    await sendMessageToChannel(`❌ Listing <b>${listingCode}</b> not found.`, senderId);
    return;
  }

  console.log(`➕ Adding ${photoGroups.length} photos to ${listingCode}...`);
  const currentCount = await prisma.accountImage.count({ where: { accountId: account.id } });
  await Promise.all(photoGroups.map((photos, i) => uploadAndAttachPhoto(photos, account.id, currentCount === 0 && i === 0)));

  await sendMessageToChannel(
    `✅ Added <b>${photoGroups.length}</b> photo(s) to listing <b>${listingCode}</b>!`,
    senderId
  );
};

// ─── Media Group Batch Collector (Sliding Window) ────────────────────────────
// Resets the timer on EVERY new photo arrival.
// Fires 3s after the LAST photo received — so all photos are always captured.
interface PendingGroup {
  text: string;
  senderId: string;
  photos: any[][];
  timer: ReturnType<typeof setTimeout>;
}
const pendingGroups = new Map<string, PendingGroup>();

const resetGroupTimer = (mediaGroupId: string) => {
  const group = pendingGroups.get(mediaGroupId);
  if (!group) return;
  clearTimeout(group.timer);
  group.timer = setTimeout(() => processGroupBatch(mediaGroupId), 3000);
};

const handleAutoListing = async (message: any, senderId: string, mediaGroupId?: string) => {
  const text = message.caption || message.text || '';

  if (mediaGroupId) {
    if (pendingGroups.has(mediaGroupId)) {
      const group = pendingGroups.get(mediaGroupId)!;
      if (message.photo) group.photos.push(message.photo);
      resetGroupTimer(mediaGroupId);
    } else {
      const group: PendingGroup = {
        text,
        senderId,
        photos: message.photo ? [message.photo] : [],
        timer: setTimeout(() => processGroupBatch(mediaGroupId), 3000),
      };
      pendingGroups.set(mediaGroupId, group);
    }
  } else {
    await createAccountFromText(text, senderId, message.photo ? [message.photo] : []);
  }
};

const handleGroupPhoto = async (message: any, mediaGroupId: string, senderId: string) => {
  if (pendingGroups.has(mediaGroupId)) {
    const group = pendingGroups.get(mediaGroupId)!;
    if (message.photo) group.photos.push(message.photo);
    resetGroupTimer(mediaGroupId);
  }
};

const processGroupBatch = async (mediaGroupId: string) => {
  const group = pendingGroups.get(mediaGroupId);
  if (!group) return;
  pendingGroups.delete(mediaGroupId);

  console.log(`⏱ Processing batch for group ${mediaGroupId}: ${group.photos.length} photos`);
  await createAccountFromText(group.text, group.senderId, group.photos);
};

const createAccountFromText = async (text: string, senderId: string, photoGroups: any[][]) => {
  const seller = await prisma.seller.findFirst();
  if (!seller) {
    await sendMessageToChannel('❌ Cannot auto-list: No seller profile found in the database.', senderId);
    return;
  }

  // ─── Line-based parser ───────────────────────────────────────────────────
  // Handles both "Field * Value" and "Field = Value" separators
  let rank = 'Unknown Rank';
  let title = '';
  let titleMyanmar = '';
  let description = '';
  let skinCount = 0;
  let emblemCount = 0;
  let heroCount = 0;
  let price = 0;
  let server = 'Global';
  let winRate = 50.0;
  let totalMatches = 0;
  let level = 0;
  let listingCode = `TG-${Date.now().toString().slice(-6)}`;

  const lines = text.split('\n');
  const fieldMap: Record<string, string> = {};
  let descLines: string[] = [];
  let inDescription = false;

  for (const line of lines) {
    // Support both "Field * Value" and "Field = Value" separators
    const sepMatch = line.match(/^([^*=]+)[*=](.*)$/);
    if (sepMatch) {
      const key = sepMatch[1].trim().toLowerCase();
      const val = sepMatch[2].trim();

      if (key.includes('description')) {
        inDescription = true;
        if (val) descLines.push(val);
      } else {
        inDescription = false;
        fieldMap[key] = val;
      }
    } else if (inDescription && line.trim() && !line.startsWith('#')) {
      descLines.push(line.trim());
    } else {
      inDescription = false;
    }
  }

  const num = (key: string) => {
    const val = fieldMap[key] || '';
    return val ? parseFloat(val.replace(/[^0-9.]/g, '')) || 0 : 0;
  };
  const str = (key: string) => fieldMap[key] || '';

  const rawCode = str('listing id');
  if (rawCode) listingCode = rawCode.replace(/\s+/g, '-');

  title        = str('title') || 'Unknown';
  rank         = str('title') || str('rank') || 'Unknown Rank';
  titleMyanmar = str('title (myanmar)');
  price        = num('price (mmk)') || num('price');
  heroCount    = num('hero count');
  skinCount    = num('skin count');
  emblemCount  = num('emblem count');
  winRate      = num('win rate (%)') || num('win rate') || 50.0;
  totalMatches = num('total matches');
  level        = num('level');
  server       = str('server') || 'Global';
  description  = descLines.join('\n') || str('collector tier') || '';

  // Ensure unique listing code
  const existing = await prisma.account.findUnique({ where: { listingCode } });
  if (existing) listingCode = `TG-${Date.now().toString().slice(-6)}`;

  try {
    const account = await prisma.account.create({
      data: {
        listingCode,
        sellerId: seller.id,
        title: title || rank,
        titleMyanmar: titleMyanmar || undefined,
        description: description || undefined,
        rank,
        skinCount,
        emblemCount,
        heroCount,
        price,
        server,
        winRate,
        totalMatches,
        level,
        status: 'AVAILABLE',
      }
    });

    // Upload ALL photos in parallel
    console.log(`📷 Uploading ${photoGroups.length} photos for account ${account.id}...`);
    await Promise.all(photoGroups.map((photos, i) => uploadAndAttachPhoto(photos, account.id, i === 0)));

    console.log(`✅ Account created: ${listingCode} (${rank}) with ${photoGroups.length} photos`);
    await sendMessageToChannel(
      `✅ Successfully listed on Website!\nListing Code: <b>${listingCode}</b>\nTitle: ${title || rank}\nPrice: <b>${price.toLocaleString()} MMK</b>\nPhotos: ${photoGroups.length}`,
      senderId
    );
  } catch (err: any) {
    console.error('Failed to create account:', err);
    await sendMessageToChannel(`❌ Failed to list account: ${err.message}`, senderId);
  }
};

const uploadAndAttachPhoto = async (photos: any[], accountId: string, isPrimary: boolean) => {
  const photo = photos[photos.length - 1]; // highest resolution
  const fileUrl = await getTelegramFileUrl(photo.file_id);
  if (!fileUrl) return;

  try {
    const imageRes = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageRes.data);
    const uploadRes = await uploadImage(buffer, 'accounts');

    await prisma.accountImage.create({
      data: {
        accountId,
        url: uploadRes.url,
        publicId: uploadRes.publicId,
        isPrimary,
      }
    });
    console.log(`📷 Image attached to account ${accountId}`);
  } catch (err) {
    console.error('Failed to upload photo:', err);
  }
};
