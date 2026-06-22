import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadSingle } from '../middleware/upload.middleware';
import { uploadImage, deleteImage } from '../services/cloudinary.service';

const prisma = new PrismaClient();

// Get all active games (public)
export const getActiveGames = async (req: Request, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { displayOrder: 'asc' },
      include: {
        packages: {
          where: { status: 'ACTIVE' },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch games',
    });
  }
};

// Get all games (admin)
export const getAllGames = async (req: Request, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        packages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch games',
    });
  }
};

// Get single game
export const getGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        packages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch game',
    });
  }
};

// Create game (admin)
export const createGame = async (req: Request, res: Response) => {
  try {
    const { name, status, displayOrder } = req.body;
    const file = req.file;

    let logo = null;
    let publicId = null;

    if (file) {
      const uploadResult = await uploadImage(file.buffer, 'game-logos');
      logo = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const game = await prisma.game.create({
      data: {
        name,
        logo,
        publicId,
        status: status || 'ACTIVE',
        displayOrder: parseInt(displayOrder) || 0,
      },
    });

    return res.status(201).json({
      success: true,
      data: game,
      message: 'Game created successfully',
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create game',
    });
  }
};

// Update game (admin)
export const updateGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status, displayOrder } = req.body;
    const file = req.file;

    const existingGame = await prisma.game.findUnique({
      where: { id },
    });

    if (!existingGame) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    let logo = existingGame.logo;
    let publicId = existingGame.publicId;

    if (file) {
      if (publicId) {
        await deleteImage(publicId);
      }
      const uploadResult = await uploadImage(file.buffer, 'game-logos');
      logo = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const game = await prisma.game.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingGame.name,
        logo,
        publicId,
        status: status !== undefined ? status : existingGame.status,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existingGame.displayOrder,
      },
    });

    return res.status(200).json({
      success: true,
      data: game,
      message: 'Game updated successfully',
    });
  } catch (error) {
    console.error('Error updating game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update game',
    });
  }
};

// Delete game (admin)
export const deleteGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    if (game.publicId) {
      await deleteImage(game.publicId);
    }

    await prisma.game.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete game',
    });
  }
};

// Toggle game status (admin)
export const toggleGameStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: { status: game.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
    });

    return res.status(200).json({
      success: true,
      data: updatedGame,
      message: 'Game status updated successfully',
    });
  } catch (error) {
    console.error('Error toggling game status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle game status',
    });
  }
};
