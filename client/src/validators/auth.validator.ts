import z from 'zod'



const AVATAR_MAX = 200 * 1024;
const COVER_MAX = 200 * 1024;

const ALLOWED_IMAGE_MIMES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
] as const;

type ImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];

const ALLOWED_IMAGE_EXTENSIONS = [
    'jpg',
    'jpeg',
    'png',
    'webp'
] as const;

type ImageExtensions = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];


const createBrowserImageSchema = (fieldName: string, maxSizeBytes: number, isOptional = false) => {
	return z.custom<File | undefined>().superRefine(
		(file, ctx) => {
			if (isOptional && !file) return;

			if (!file || !(file instanceof File)) {
				ctx.addIssue({
					code: 'custom',
					message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} file upload is required`,
				});

				return;
			}

			if (file.size > maxSizeBytes) {
				ctx.addIssue({
					code: 'custom',
					message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} size limit exceeded. Max allowed is 200 KB`,
				});

				return;
			}

			const extention = file.name.split('.').pop()?.toLowerCase();

			const isValidMime = ALLOWED_IMAGE_MIMES.includes(file.type as ImageMime);

			const isValidExtention = extention ? ALLOWED_IMAGE_EXTENSIONS.includes(extention as ImageExtensions) : false;

			if (!isValidMime && !isValidExtention) {
				ctx.addIssue({
					code: 'custom',
					message: `Invalid ${fieldName} format. Only JPEG, PNG, and WebP images are allowed`,
				});

				return;
			}
		}
	);
};

const nativeEmailValidator = z
	.email({pattern: z.regexes.rfc5322Email})
	.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' });


const strongPasswordSchema = z
	.string()
	.trim()
	.min(6, 'Password must be atleast 6 characters long')
	.max(12, 'Password must not exceed 12 characters')
	.regex(/[A-Z]/, 'Password must contain atleast 1 uppercase letter')
	.regex(/[a-z]/, 'Password must contain atleast 1 lowercase letter')
	.regex(/[0-9]/, 'Password must contain atleast 1 number')
	.regex(/[!@#$%^&*(),.?':{}|<>]/, 'Password must contain atleast 1 special character')
	.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' });


export const baseRegisterUserSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(3, 'First name must be atleast 3 characters long')
		.max(255, 'First name must not exceed 255 characters')
		.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' }),
	lastName: z
		.string()
		.trim()
		.min(3, 'Last name must be atleast 3 characters long')
		.max(255, 'Last name must not exceed 255 characters')
		.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' }),
	email: z
    .string()
    .trim()
    .pipe(nativeEmailValidator),
	username: z
		.string({ error: 'User name is required' })
		.trim()
		.min(3, 'Username must be atleast 3 characters long')
		.max(255, 'Username must not exceed 255 characters')
		.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' })
		.regex(/^[a-z0-9]+$/, { error: 'Username must be in lowercase and alphanumeric' }),
	password: strongPasswordSchema,
	confirmPassword: z
		.string()
		.min(6, 'Please confirm your password')
		.trim()
		.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' }),
	avatar: createBrowserImageSchema('avatar', AVATAR_MAX, false),
	coverImage: createBrowserImageSchema('coverImage', COVER_MAX, true).optional(),
});

export const registerUserSchema = baseRegisterUserSchema.superRefine(
	({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: 'custom',
				message: 'Passwords do not match',
				path: ['confirmPassword']
			});
		}
	},
);

export type RegisterFormData = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z
	.object({
		userIdentity: z
			.string({ error: 'User identity (username or email) is required' })
			.trim()
			.toLowerCase()
			.min(3, 'Identity entry must be at least 3 characters long')
			.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' }),
		password: strongPasswordSchema,
	})
	.superRefine(({ userIdentity }, ctx) => {
		if (!userIdentity || userIdentity.length < 3) return;

		if (userIdentity.includes('@')) {
			const result = nativeEmailValidator.safeParse(userIdentity);
			if (!result.success) {
				ctx.addIssue({
					code: 'custom',
					message: result.error.issues[0].message,
					path: ['userIdentity'],
				});
			}
			return;
		}

		const isAlphanumeric = /^[a-z0-9]+$/.test(userIdentity);
		if (!isAlphanumeric) {
			ctx.addIssue({
				code: 'custom',
				message: 'Username must be in lowercase alphanumeric format',
				path: ['userIdentity'],
			});
		}
	});

export type LoginFormData = z.infer<typeof loginUserSchema>;



export const changeCurrentPasswordSchema = z
	.object({
		oldPassword: z
			.string()
			.trim()
			.regex(/^((?!\p{Emoji_Presentation}).)*$/u, { error: 'Emojis are not allowed' }),
		newPassword: strongPasswordSchema,
	})
	.refine(({ oldPassword, newPassword }) => oldPassword !== newPassword, {
		error: 'New password cannot be the same as your old password',
		path: ['newPassword'],
	});

export type ChangeCurrentPasswordFormData = z.infer<typeof changeCurrentPasswordSchema>;



export const updateAccountDetailsSchema = baseRegisterUserSchema.pick({
	firstName: true,
	lastName: true,
	email: true,
});

export type UpdateAccountDetailsFormData = z.infer<typeof updateAccountDetailsSchema>;



export const singleAvatarUpdateSchema = createBrowserImageSchema('avatar', AVATAR_MAX, false);

export type SingleAvatarFormData = z.infer<typeof singleAvatarUpdateSchema>;



export const singleCoverImageUpdateSchema = createBrowserImageSchema('coverImage', COVER_MAX, true);

export type SingleCoverFormData = z.infer<typeof singleCoverImageUpdateSchema>;