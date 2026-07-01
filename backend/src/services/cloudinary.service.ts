import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

function isCloudinaryConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  return Boolean(
    cloudName &&
      apiKey &&
      apiSecret &&
      !cloudName.includes('your_cloudinary')
  );
}

async function uploadLocal(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const dir = path.join(process.cwd(), 'uploads', folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  const publicId = `local/${folder}/${filename}`;
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${config.port}`;
  const url = `${baseUrl}/uploads/${folder}/${filename}`;
  return { url, publicId };
}

export const uploadImage = async (
  buffer: Buffer,
  folder: string,
  options: Record<string, unknown> = {}
): Promise<{ url: string; publicId: string }> => {
  if (!isCloudinaryConfigured()) {
    return uploadLocal(buffer, folder);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `panneistore/${folder}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        ...options,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (publicId.startsWith('local/')) {
    const relative = publicId.replace(/^local\//, '');
    const filePath = path.join(process.cwd(), 'uploads', relative);
    await fs.unlink(filePath).catch(() => undefined);
    return;
  }
  if (!isCloudinaryConfigured()) return;
  await cloudinary.uploader.destroy(publicId);
};

export const uploadMultipleImages = async (
  buffers: Buffer[],
  folder: string
): Promise<{ url: string; publicId: string }[]> => {
  return Promise.all(buffers.map((buf) => uploadImage(buf, folder)));
};

export { cloudinary };
