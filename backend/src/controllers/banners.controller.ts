import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int } from '../utils/helpers.utils';
import { uploadImage, deleteImage } from '../services/cloudinary.service';
import { Prisma } from '@prisma/client';

export const listBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = str(req.query.all) === 'true';
    const where: Prisma.BannerWhereInput = all ? {} : { isActive: true };
    const banners = await prisma.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });
    return successResponse(res, banners, 'Banners fetched');
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const title        = str(req.body.title) ?? '';
    const titleMyanmar = str(req.body.titleMyanmar);
    const subtitle     = str(req.body.subtitle);
    const subtitleMyanmar = str(req.body.subtitleMyanmar);
    const link         = str(req.body.link);
    const position     = str(req.body.position) ?? 'HOME_HERO';
    const sortOrder    = int(req.body.sortOrder) ?? 0;
    const isActive     = req.body.isActive !== 'false' && req.body.isActive !== false;
    const file         = req.file;

    if (!file) throw new ApiError(400, 'Banner image file is required');

    const result = await uploadImage(file.buffer, 'banners');

    const banner = await prisma.banner.create({
      data: {
        title, titleMyanmar, subtitle, subtitleMyanmar,
        imageUrl: result.url, publicId: result.publicId,
        link, position, sortOrder, isActive,
      },
    });

    return successResponse(res, banner, 'Banner created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const file = req.file;

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new ApiError(404, 'Banner not found');

    const data: Prisma.BannerUpdateInput = {};

    const title        = str(req.body.title);
    const titleMyanmar = str(req.body.titleMyanmar);
    const subtitle     = str(req.body.subtitle);
    const subtitleMyanmar = str(req.body.subtitleMyanmar);
    const link         = str(req.body.link);
    const position     = str(req.body.position);
    const sortOrder    = int(req.body.sortOrder);

    if (title !== undefined) data.title = title;
    if (titleMyanmar !== undefined) data.titleMyanmar = titleMyanmar;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (subtitleMyanmar !== undefined) data.subtitleMyanmar = subtitleMyanmar;
    if (link !== undefined) data.link = link;
    if (position !== undefined) data.position = position;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive === true || req.body.isActive === 'true';

    if (file) {
      if (banner.publicId) await deleteImage(banner.publicId).catch(console.error);
      const result = await uploadImage(file.buffer, 'banners');
      data.imageUrl = result.url;
      data.publicId = result.publicId;
    }

    const updated = await prisma.banner.update({ where: { id }, data });
    return successResponse(res, updated, 'Banner updated');
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new ApiError(404, 'Banner not found');

    if (banner.publicId) await deleteImage(banner.publicId).catch(console.error);
    await prisma.banner.delete({ where: { id } });
    return successResponse(res, null, 'Banner deleted');
  } catch (err) {
    next(err);
  }
};
