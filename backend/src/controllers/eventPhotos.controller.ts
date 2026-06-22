import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadSingle } from '../middleware/upload.middleware';
import { uploadImage, deleteImage } from '../services/cloudinary.service';

const prisma = new PrismaClient();

// Get all active event photos (public)
export const getActiveEventPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await prisma.eventPhoto.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: photos,
    });
  } catch (error) {
    console.error('Error fetching event photos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event photos',
    });
  }
};

// Get all event photos (admin)
export const getAllEventPhotos = async (req: Request, res: Response) => {
  try {
    const photos = await prisma.eventPhoto.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: photos,
    });
  } catch (error) {
    console.error('Error fetching event photos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event photos',
    });
  }
};

// Get single event photo
export const getEventPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const photo = await prisma.eventPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Event photo not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('Error fetching event photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch event photo',
    });
  }
};

// Create event photo (admin)
export const createEventPhoto = async (req: Request, res: Response) => {
  try {
    const { title, displayOrder, isActive } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(file.buffer, 'event-photos');

    const photo = await prisma.eventPhoto.create({
      data: {
        title,
        imageUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        displayOrder: parseInt(displayOrder) || 0,
        isActive: isActive !== undefined ? isActive === 'true' : true,
      },
    });

    return res.status(201).json({
      success: true,
      data: photo,
      message: 'Event photo created successfully',
    });
  } catch (error) {
    console.error('Error creating event photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event photo',
    });
  }
};

// Update event photo (admin)
export const updateEventPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, displayOrder, isActive } = req.body;
    const file = req.file;

    const existingPhoto = await prisma.eventPhoto.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        success: false,
        message: 'Event photo not found',
      });
    }

    let imageUrl = existingPhoto.imageUrl;
    let publicId = existingPhoto.publicId;

    // If new image is uploaded, delete old one and upload new
    if (file) {
      if (publicId) {
        await deleteImage(publicId);
      }
      const uploadResult = await uploadImage(file.buffer, 'event-photos');
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const photo = await prisma.eventPhoto.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingPhoto.title,
        imageUrl,
        publicId,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existingPhoto.displayOrder,
        isActive: isActive !== undefined ? isActive === 'true' : existingPhoto.isActive,
      },
    });

    return res.status(200).json({
      success: true,
      data: photo,
      message: 'Event photo updated successfully',
    });
  } catch (error) {
    console.error('Error updating event photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event photo',
    });
  }
};

// Delete event photo (admin)
export const deleteEventPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const photo = await prisma.eventPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Event photo not found',
      });
    }

    // Delete image from Cloudinary
    if (photo.publicId) {
      await deleteImage(photo.publicId);
    }

    await prisma.eventPhoto.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Event photo deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event photo:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event photo',
    });
  }
};

// Toggle event photo active status (admin)
export const toggleEventPhotoStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const photo = await prisma.eventPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Event photo not found',
      });
    }

    const updatedPhoto = await prisma.eventPhoto.update({
      where: { id },
      data: { isActive: !photo.isActive },
    });

    return res.status(200).json({
      success: true,
      data: updatedPhoto,
      message: 'Event photo status updated successfully',
    });
  } catch (error) {
    console.error('Error toggling event photo status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle event photo status',
    });
  }
};
