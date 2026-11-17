import type { Request } from 'express'
import multer, { type FileFilterCallback, type StorageEngine } from 'multer'
import { ApiError } from '../utils/ApiError.ts'


const ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp'
] as const;

const ALLOWED_VIDEO_MIMES = [
    'video/mp4',
    'video/webm',
] as const;

const ALLOWED_VIDEO_EXTENSIONS = [
    'mp4',
    'webm',
] as const;

type ImageMime = typeof ALLOWED_IMAGE_MIMES[number];
type VideoMime = typeof ALLOWED_VIDEO_MIMES[number];
type VideoExtention = typeof ALLOWED_VIDEO_EXTENSIONS[number];

const IMAGE_MAX = 200 * 1024;
const VIDEO_MAX = 5 * 1024 * 1024;


const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        cb(null, './public/temp');
    },
    filename: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    },
});


const imageFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (ALLOWED_IMAGE_MIMES.includes(file.mimetype as ImageMime)) {
        cb(null, true);
    }
    else {
        cb(new ApiError(
            400,
            'Validation Failed',
            [
                {
                    field: file.fieldname,
                    message: `Invalid ${file.fieldname} format. Only JPEG, PNG, and WebP images are allowed`
                }
            ]
        ));
    }
};


const videoFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (file.fieldname === 'thumbnail') {
        if (ALLOWED_IMAGE_MIMES.includes(file.mimetype as ImageMime)) {
            cb(null, true);
        }
        else {
            cb(new ApiError(
                400,
                'Validation Failed',
                [
                    {
                        field: file.fieldname,
                        message: `Invalid ${file.fieldname} format. Only JPEG, PNG, and WebP images are allowed`
                    }
                ]
            ));
        }
    }

    else {
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        const isValidMime = ALLOWED_VIDEO_MIMES.includes(file.mimetype as VideoMime);
        const isValidExtention = extension
            ? ALLOWED_VIDEO_EXTENSIONS.includes(extension as VideoExtention)
            : false;
        
        if (isValidMime || isValidExtention) {
            cb(null, true);
        }

        else {
            cb(new ApiError(
                400,
                'Validation Failed',
                [
                    {
                        field: file.fieldname,
                        message: `Invalid ${file.fieldname} format. Only MP4 and WEBM videos are allowed`
                    }
                ]
            ));
        }
    }
};


export const uploadImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: IMAGE_MAX
    }
});

export const uploadVideo = multer({
    storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: VIDEO_MAX
    }
});