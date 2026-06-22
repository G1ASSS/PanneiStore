import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadImage, deleteImage } from '../services/cloudinary.service';

const prisma = new PrismaClient();

// GET all announcements (admin)
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcementPopup.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: announcements });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
};

// GET active announcement (public)
export const getActiveAnnouncement = async (req: Request, res: Response) => {
  try {
    // There should usually only be 1 active announcement, but we'll fetch the latest one
    const announcement = await prisma.announcementPopup.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json({ success: true, data: announcement });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch announcement' });
  }
};

// POST create announcement (admin)
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, content, buttonText, buttonUrl, isActive } = req.body;
    const file = (req as any).file;

    let imageUrl = null;
    let publicId = null;
    if (file) {
      const result = await uploadImage(file.buffer, 'announcements');
      imageUrl = result.url;
      publicId = result.publicId;
    }

    // If making this active, deactivate others if business logic dictates (optional, we'll let admin manage it manually or force it here)
    if (isActive === 'true') {
      await prisma.announcementPopup.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const announcement = await prisma.announcementPopup.create({
      data: {
        title,
        content,
        buttonText: buttonText || null,
        buttonUrl: buttonUrl || null,
        imageUrl,
        publicId,
        isActive: isActive === 'true',
      },
    });
    return res.status(201).json({ success: true, data: announcement, message: 'Announcement created' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
};

// PUT update announcement (admin)
export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, buttonText, buttonUrl, isActive } = req.body;
    const file = (req as any).file;

    const existing = await prisma.announcementPopup.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    let imageUrl = existing.imageUrl;
    let publicId = existing.publicId;
    if (file) {
      if (publicId) await deleteImage(publicId);
      const result = await uploadImage(file.buffer, 'announcements');
      imageUrl = result.url;
      publicId = result.publicId;
    }

    if (isActive === 'true' && !existing.isActive) {
      await prisma.announcementPopup.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const announcement = await prisma.announcementPopup.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        content: content ?? existing.content,
        buttonText: buttonText !== undefined ? buttonText : existing.buttonText,
        buttonUrl: buttonUrl !== undefined ? buttonUrl : existing.buttonUrl,
        imageUrl,
        publicId,
        isActive: isActive !== undefined ? isActive === 'true' : existing.isActive,
      },
    });
    return res.json({ success: true, data: announcement, message: 'Announcement updated' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
};

// DELETE announcement (admin)
export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcementPopup.findUnique({ where: { id } });
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
    if (announcement.publicId) await deleteImage(announcement.publicId);
    await prisma.announcementPopup.delete({ where: { id } });
    return res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to delete' });
  }
};

// PATCH toggle active (admin)
export const toggleAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcementPopup.findUnique({ where: { id } });
    if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });

    if (!announcement.isActive) {
      // deactivate all others before activating this one
      await prisma.announcementPopup.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const updated = await prisma.announcementPopup.update({
      where: { id },
      data: { isActive: !announcement.isActive },
    });
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to toggle' });
  }
};
