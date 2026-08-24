import z from 'zod'
import { ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIMES, type ImageExtensions, type ImageMime } from './auth.validator.ts'



const THUMBNAIL_MAX = 200 * 1024;
const VIDEO_MAX = 5 * 1024 * 1024;

const ALLOWED_VIDEO_MIMES = [
    'video/mp4',
    'video/webm',
    'video/x-matroska',
    'video/quicktime'
] as const;

type VideoMime = (typeof ALLOWED_VIDEO_MIMES)[number];

const ALLOWED_VIDEO_EXTENSIONS = [
    'mp4',
    'webm',
    'ogg',
    'mov',
    'quicktime'
] as const;

type VideoExtensions = (typeof ALLOWED_VIDEO_EXTENSIONS)[number];


const createBrowserFileSchema = <TMime extends string, TExt extends string>(
    fieldName: 'video' | 'thumbnail',
    maxSizeBytes: number,
    allowedMimes: readonly TMime[],
    allowedExtensions: readonly TExt[],
    formatErrorMessage: string,
    isOptional = false
) => {
    return z.custom<File | undefined>().superRefine((file, ctx) => {
        if (isOptional && !file) return;

        if (!file || !(file instanceof File)) {
            ctx.addIssue({
                code: 'custom',
                message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} file upload is required`,
            });

            return;
        }

        if (file.size > maxSizeBytes) {
            const sizeInMB = Math.round(maxSizeBytes / (1024 * 1024));

            ctx.addIssue({
                code: 'custom',
                message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} size limit exceeded. Max allowed is ${sizeInMB} MB`,
            });

            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();

        const isValidMime = allowedMimes.includes(file.type as TMime);

        const isValidExtention = extension ? allowedExtensions.includes(extension as TExt) : false;

        if (!isValidMime && !isValidExtention) {
            ctx.addIssue({
                code: 'custom',
                message: formatErrorMessage
            });

            return;
        }
    });
};


export const createBrowserThumbnailSchema = (isOptional = false) =>
    createBrowserFileSchema<ImageMime, ImageExtensions>(
        'thumbnail',
        THUMBNAIL_MAX,
        ALLOWED_IMAGE_MIMES,
        ALLOWED_IMAGE_EXTENSIONS,
        'Invalid thumbnail format. Only JPEG, PNG, and WebP images are allowed',
        isOptional
    );


export const createBrowserVideoSchema = (isOptional = false) =>
    createBrowserFileSchema<VideoMime, VideoExtensions>(
        'video',
        VIDEO_MAX,
        ALLOWED_VIDEO_MIMES,
        ALLOWED_VIDEO_EXTENSIONS,
        'Invalid video format. Only MP4, WEBM, MKV, and MOV videos are allowed',
        isOptional
    );


export const baseVideoPayloadSchema = z.object({
    title: z.
        string({ error: 'Title is required' })
        .trim()
        .min(3, 'Title must be at least 3 characters long')
        .max(150, 'Title must not exceed 150 characters')
        .regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' }),
    description: z
        .string({ error: 'Description is required' })
        .trim()
        .min(5, 'Description must be at least 5 characters long')
        .max(2000, 'Description must not exceed 2000 characters'),
});


export const publishVideoPayloadSchema = baseVideoPayloadSchema.extend({
    videoFile: createBrowserVideoSchema(false),
    thumbnail: createBrowserThumbnailSchema(false),
});

export type PublishVideoFormData = z.infer<typeof publishVideoPayloadSchema>;



export const updateVideoPayloadSchema = baseVideoPayloadSchema.extend({
    thumbnail: createBrowserThumbnailSchema(true).optional()
});

export type UpdateVideoFormData = z.infer<typeof updateVideoPayloadSchema>;