import { Response } from 'express';
import cloudinary from '../../config/cloudinary/cloudinary';
import { sendSuccess } from '../../shared/utils/apiResponse/ApiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler/asyncHandler';
import { AuthRequest } from '../../shared/types/express/express';

export const uploadProductImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    sendSuccess(res, 'No se proporcionó imagen', null);
    return;
  }

  const file = req.file;

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `tenant-${req.user!.tenantId}`, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  sendSuccess(res, 'Imagen subida', { url: result.secure_url });
});
