import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get packages by game (public)
export const getPackagesByGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const packages = await prisma.topUpPackage.findMany({
      where: { 
        gameId,
        status: 'ACTIVE',
      },
      orderBy: { displayOrder: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
    });
  }
};

// Get all packages (admin)
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const packages = await prisma.topUpPackage.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        game: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
    });
  }
};

// Get single package
export const getPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.topUpPackage.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
    });
  }
};

// Create package (admin)
export const createPackage = async (req: Request, res: Response) => {
  try {
    const { gameId, packageName, price, category, status, displayOrder } = req.body;

    const pkg = await prisma.topUpPackage.create({
      data: {
        gameId,
        packageName,
        price: parseFloat(price),
        category,
        status: status || 'ACTIVE',
        displayOrder: parseInt(displayOrder) || 0,
      },
    });

    return res.status(201).json({
      success: true,
      data: pkg,
      message: 'Package created successfully',
    });
  } catch (error) {
    console.error('Error creating package:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create package',
    });
  }
};

// Update package (admin)
export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { gameId, packageName, price, category, status, displayOrder } = req.body;

    const existingPackage = await prisma.topUpPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    const pkg = await prisma.topUpPackage.update({
      where: { id },
      data: {
        gameId: gameId !== undefined ? gameId : existingPackage.gameId,
        packageName: packageName !== undefined ? packageName : existingPackage.packageName,
        price: price !== undefined ? parseFloat(price) : existingPackage.price,
        category: category !== undefined ? category : existingPackage.category,
        status: status !== undefined ? status : existingPackage.status,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existingPackage.displayOrder,
      },
    });

    return res.status(200).json({
      success: true,
      data: pkg,
      message: 'Package updated successfully',
    });
  } catch (error) {
    console.error('Error updating package:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update package',
    });
  }
};

// Delete package (admin)
export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pkg = await prisma.topUpPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    await prisma.topUpPackage.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete package',
    });
  }
};

// Toggle package status (admin)
export const togglePackageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pkg = await prisma.topUpPackage.findUnique({
      where: { id },
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    const updatedPackage = await prisma.topUpPackage.update({
      where: { id },
      data: { status: pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
    });

    return res.status(200).json({
      success: true,
      data: updatedPackage,
      message: 'Package status updated successfully',
    });
  } catch (error) {
    console.error('Error toggling package status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle package status',
    });
  }
};
