import { v2 as cloudinary } from 'cloudinary';
import { env } from '../env/env';
import { logger } from '../logger/logger';

export const isCloudinaryConfigured = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  try {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    logger.info('✅ Cloudinary configurado exitosamente');
  } catch (error) {
    logger.error(`Error al configurar Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
  }
} else {
  logger.info('Cloudinary no configurado — usando almacenamiento local de archivos');
}

export default cloudinary;
