import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadImage, deleteImage } from '../services/cloudinary.service';

const prisma = new PrismaClient();

// GET all banners (admin)
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.json({ success: true, data: banners });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
};

// GET active banners (public - for home page)
export const getActiveBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return res.json({ success: true, data: banners });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
};

// POST create banner (admin)
export const createBanner = async (req: Request, res: Response) => {
  try {
    const { title, subtitle, buttonText, buttonUrl, isActive, displayOrder } = req.body;
    const file = (req as any).file;

    let imageUrl = null;
    let publicId = null;
    if (file) {
      const result = await uploadImage(file.buffer, 'hero-banners');
      imageUrl = result.url;
      publicId = result.publicId;
    }

    const banner = await prisma.heroBanner.create({
      data: {
        title,
        subtitle: subtitle || null,
        buttonText: buttonText || null,
        buttonUrl: buttonUrl || null,
        imageUrl,
        publicId,
        isActive: isActive === 'false' ? false : true,
        displayOrder: parseInt(displayOrder) || 0,
      },
    });
    return res.status(201).json({ success: true, data: banner, message: 'Banner created' });
  } catch (e) {
    console.error('Error creating banner:', e);
    return res.status(500).json({ success: false, message: 'Failed to create banner' });
  }
};

// PUT update banner (admin)
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subtitle, buttonText, buttonUrl, isActive, displayOrder } = req.body;
    const file = (req as any).file;

    const existing = await prisma.heroBanner.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Banner not found' });

    let imageUrl = existing.imageUrl;
    let publicId = existing.publicId;
    if (file) {
      if (publicId) await deleteImage(publicId);
      const result = await uploadImage(file.buffer, 'hero-banners');
      imageUrl = result.url;
      publicId = result.publicId;
    }

    const banner = await prisma.heroBanner.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
        buttonText: buttonText !== undefined ? buttonText : existing.buttonText,
        buttonUrl: buttonUrl !== undefined ? buttonUrl : existing.buttonUrl,
        imageUrl,
        publicId,
        isActive: isActive !== undefined ? (isActive === 'false' ? false : Boolean(isActive)) : existing.isActive,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existing.displayOrder,
      },
    });
    return res.json({ success: true, data: banner, message: 'Banner updated' });
  } catch (e) {
    console.error('Error updating banner:', e);
    return res.status(500).json({ success: false, message: 'Failed to update banner' });
  }
};

// DELETE banner (admin)
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await prisma.heroBanner.findUnique({ where: { id } });
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
    if (banner.publicId) await deleteImage(banner.publicId);
    await prisma.heroBanner.delete({ where: { id } });
    return res.json({ success: true, message: 'Banner deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
};

// PATCH toggle active (admin)
export const toggleBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const banner = await prisma.heroBanner.findUnique({ where: { id } });
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = await prisma.heroBanner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to toggle banner' });
  }
};
