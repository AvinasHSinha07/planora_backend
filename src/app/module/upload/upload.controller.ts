import { NextFunction, Request, Response } from 'express';
import { sendImageToCloudinary } from '../../utils/cloudinary';
import AppError from '../../errorHelpers/AppError';
import status from 'http-status';

/**
 * POST /api/v1/upload/image
 * Accepts a single file field named "file", uploads to Cloudinary,
 * and returns the secure URL.
 */
const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError(status.BAD_REQUEST, 'Image file is missing');
        }

        const imageName = req.file.fieldname + '-' + Date.now();
        const result = await sendImageToCloudinary(imageName, req.file.path) as any;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.secure_url || result.url,
                publicId: result.public_id,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const UploadController = {
    uploadImage,
};
