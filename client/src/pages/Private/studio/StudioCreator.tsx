import { useState, useEffect, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, Image as ImageIcon, Video as VideoIcon, Loader2, Sparkles, FileVideo, CheckCircle2, Trash2 } from 'lucide-react'
import { usePublishVideo } from '../../../hooks/useVideoMutations.ts'
import { publishVideoPayloadSchema, type PublishVideoFormData } from '../../../validators/video.validator.ts'
import { Button, Input, Textarea, VideoPlayer } from '../../../components/common/index.ts'
import { useDropzone } from 'react-dropzone'
import { formatBytesToReadable } from '../../../utils/formatBytesToReadable.ts'
import { toast } from 'sonner'



interface StudioCreatorProps {
	onSuccess?: () => void;
}

const StudioCreator = ({ onSuccess }: StudioCreatorProps) => {
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const { mutate: publishVideo, isPending: isPublishingVideo } = usePublishVideo(setUploadProgress);

	const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
	const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
	const [isPreviewPlayable, setIsPreviewPlayable] = useState<boolean>(true);
	const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isDirty },
	} = useForm<PublishVideoFormData>({
		resolver: zodResolver(publishVideoPayloadSchema),
		mode: 'onTouched',
		defaultValues: {
			title: '',
			description: '',
		},
	});

	const descriptionValue = watch('description') || '';

	// Clean up generated object URLs to prevent memory leaks
	useEffect(() => {
		return () => {
			if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
			if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
		}
	}, [videoPreviewUrl, thumbnailPreviewUrl]);

	const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
		onDrop: (acceptedFiles) => {
			const file = acceptedFiles[0];
			if (!file) return;

			setValue('videoFile', file, {
				shouldValidate: true,
				shouldDirty: true,
			});

			if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);

			const objectUrl = URL.createObjectURL(file);
			setSelectedVideoFile(file);
			setVideoPreviewUrl(objectUrl);

			// Check if browser can natively play this MIME type
			const testVideo = document.createElement('video');
			const canPlay = file.type ? testVideo.canPlayType(file.type) !== '' : false;
			setIsPreviewPlayable(canPlay);
		},
		onDropRejected: (fileRejections) => {
			const rejection = fileRejections[0];
			const errorMsg = rejection?.errors[0]?.message || 'Invalid file format or size';
			console.warn('Drop rejected: ', errorMsg);
			toast.warning(errorMsg);
		},
		multiple: false,
		disabled: isPublishingVideo,
		noClick: Boolean(videoPreviewUrl),
		accept: {
			'video/mp4': ['.mp4'],
			'video/webm': ['.webm'],
		},
	});

	const handleRemoveVideo = () => {
		if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
		setVideoPreviewUrl(null);
		setSelectedVideoFile(null);
		setIsPreviewPlayable(true);
		setValue('videoFile', undefined as unknown as File, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			setValue('thumbnail', file, {
				shouldValidate: true,
				shouldDirty: true,
			});
			if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
			setThumbnailPreviewUrl(URL.createObjectURL(file));
		}
	};

	const onSubmit: SubmitHandler<PublishVideoFormData> = (data) => {
		publishVideo(data, {
			onSuccess: () => {
				reset();
				setVideoPreviewUrl(null);
				setSelectedVideoFile(null);
				setIsPreviewPlayable(true);
				setThumbnailPreviewUrl(null);
				onSuccess?.();
			},
		});
	};

	return (
		<div className='space-y-8 duration-300 w-full'>
			{/* Creator Tab Header Hero Card */}
			<div className='bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden group'>
				<div className='absolute -right-16 -top-16 size-40 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/10 transition-colors duration-500' />

				<div className='flex items-center gap-4 z-10'>
					<div className='p-3.5 rounded-2xl bg-purple-600/10 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs'>
						<Sparkles size={24} />
					</div>
					<div>
						<h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2'>
							Creator Studio
						</h2>
						<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-0.5'>
							Upload, configure, and publish fresh content directly to your channel pipeline.
						</p>
					</div>
				</div>

				<div className='text-left sm:text-right z-10 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800/80'>
					<span className='text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block'>
						Max Upload Size
					</span>
					<span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mt-1 border border-zinc-200 dark:border-zinc-700/60'>
						5 MB Video / 200 KB Image
					</span>
				</div>
			</div>

			{/* Main Upload Form Layout */}
			<form onSubmit={handleSubmit(onSubmit)} className='w-full space-y-6'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
					
					{/* Left Column (Video Player Preview & Dropzone) */}
					<div className='lg:col-span-7 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 shadow-xs space-y-4'>
						<span className='text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block'>
							Video File & Preview
						</span>

						{/* Dropzone & Video Preview Box */}
						<div
							{...getRootProps()}
							className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 flex items-center justify-center shadow-xs ${
								isDragActive
									? 'border-purple-600 bg-purple-600/10 dark:bg-purple-500/10'
									: 'border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/80 dark:bg-zinc-900/80 hover:border-purple-500/60'
							} ${!videoPreviewUrl ? 'cursor-pointer' : ''}`}
							title='Upload Video'
						>
							<input {...getInputProps()} />

							{/* Drag Active Overlay */}
							{isDragActive && (
								<div className='absolute inset-0 z-30 bg-purple-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center'>
									<Upload size={36} className='animate-bounce mb-2 text-purple-300' />
									<p className='text-sm font-bold'>Drop your video file here</p>
								</div>
							)}

							{videoPreviewUrl && selectedVideoFile && !errors.videoFile ? (
								isPreviewPlayable ? (
									<VideoPlayer
										src={videoPreviewUrl}
										poster={thumbnailPreviewUrl || undefined}
									/>
								) : (
									/* Fallback UI for MKV / MOV / Unplayable Browser Codecs */
									<div className='flex flex-col items-center justify-center gap-3 p-6 text-center max-w-md'>
										<div className='p-4 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'>
											<FileVideo size={36} />
										</div>
										<div className='space-y-1'>
											<div className='inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
												<CheckCircle2 size={14} />
												<span>Video Staged for Upload</span>
											</div>
											<p className='text-sm font-bold text-zinc-900 dark:text-zinc-100 break-all line-clamp-1'>
												{selectedVideoFile.name}
											</p>
											<p className='text-xs text-zinc-500 dark:text-zinc-400'>
												Size: {formatBytesToReadable(selectedVideoFile.size)} &bull; Browser preview is unavailable for this container format, but it will transcode properly upon publishing.
											</p>
										</div>
									</div>
								)
							) : (
								<div className='flex flex-col items-center gap-2.5 text-zinc-400 p-6 text-center max-w-sm'>
									<div className='p-4 rounded-full bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400'>
										<VideoIcon size={32} />
									</div>
									<div>
										<p className='text-sm font-semibold text-zinc-700 dark:text-zinc-300'>
											Drag & drop your video here, or click to browse
										</p>
										<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1'>
											Supports MP4, and WEBM, formats up to 5MB
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Footer Spec & Dropzone open() Action Bar */}
						<div className='flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60'>
							<span className='text-[11px] text-zinc-500 dark:text-zinc-400 font-medium'>
								Supported Formats:{' '}
								<span className='font-semibold text-zinc-700 dark:text-zinc-300'>
									MP4, WEBM
								</span>{' '}
								(Max 5MB)
							</span>

							{videoPreviewUrl && (
								<div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
									<button
										type='button'
										onClick={open}
										disabled={isPublishingVideo}
										className='inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-50'
									>
										<Upload size={13} />
										<span>Replace Video</span>
									</button>

									<button
										type='button'
										onClick={handleRemoveVideo}
										disabled={isPublishingVideo}
										className='inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-50'
										title='Remove Video'
									>
										<Trash2 size={13} />
										<span>Remove</span>
									</button>
								</div>
							)}
						</div>

						{errors.videoFile && (
							<span className='inline-flex items-center gap-1 text-xs font-medium text-red-500'>
								{errors.videoFile.message}
							</span>
						)}
					</div>

					{/* Right Column (Metadata Fields & Thumbnail) */}
					<div className='lg:col-span-5 space-y-6'>
						
						{/* Video Information Card */}
						<div className='bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 shadow-xs space-y-4'>
							<span className='text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block'>
								Video Metadata
							</span>

							<Input
								label='Video Title'
								type='text'
								placeholder='Enter a catchy video title'
								title='Video Title'
								error={errors.title?.message}
								isOptionalField={false}
								disabled={isPublishingVideo}
								{...register('title')}
							/>

							<Textarea
								label='Description'
								rows={4}
								placeholder='Tell viewers about your video'
								textLength={descriptionValue.length}
								maxLength={2000}
								disabled={isPublishingVideo}
								error={errors.description?.message}
								isOptionalField={false}
								className='scrollbar-thumb-purple-600/20 dark:scrollbar-thumb-purple-400/20 scrollbar-thin'
								{...register('description')}
							/>
						</div>

						{/* Thumbnail Upload Card */}
						<div className='bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 shadow-xs space-y-4'>
							<span className='text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block'>
								Thumbnail Asset
							</span>

							<div className='flex flex-col sm:flex-row items-center gap-4'>
								<div className='relative w-full sm:w-36 shrink-0 aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-xs'>
									{thumbnailPreviewUrl ? (
										<img
											src={thumbnailPreviewUrl}
											alt='Thumbnail Preview'
											className='size-full object-cover'
											loading='lazy'
										/>
									) : (
										<div className='flex flex-col items-center gap-1 text-zinc-400'>
											<ImageIcon size={20} />
											<span className='text-[10px] font-medium'>No Thumbnail</span>
										</div>
									)}
								</div>

								<div className='flex flex-col items-start gap-2 w-full'>
									<label
										htmlFor='studio-thumbnail-upload'
										className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
											isPublishingVideo
												? 'opacity-50 pointer-events-none'
												: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60'
										}`}
										title={`${thumbnailPreviewUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}`}
									>
										<Upload size={14} />
										<span>
											{thumbnailPreviewUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
										</span>
									</label>

									<input
										id='studio-thumbnail-upload'
										type='file'
										accept='image/jpeg,image/png,image/webp'
										className='hidden'
										onChange={handleThumbnailChange}
										disabled={isPublishingVideo}
									/>

									<p className='text-[11px] text-zinc-500 dark:text-zinc-400 font-medium'>
										Aspect ratio <span className='font-semibold text-zinc-700 dark:text-zinc-300'>16:9</span> • Max size <span className='font-semibold text-zinc-700 dark:text-zinc-300'>200KB</span>
									</p>
								</div>
							</div>

							{errors.thumbnail && (
								<span className='inline-flex items-center gap-1 text-xs font-medium text-red-500'>
									{errors.thumbnail.message}
								</span>
							)}
						</div>

					</div>
				</div>

				{/* Dashboard Action Footer Bar */}
				<div className='bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-3 shadow-xs'>
					{isPublishingVideo && (
						<div className='space-y-1.5 w-full'>
							<div className='flex justify-between text-xs font-medium'>
								<span className='text-zinc-600 dark:text-zinc-400'>Uploading video & assets...</span>
								<span className='text-purple-600 dark:text-purple-400 font-bold'>{uploadProgress}%</span>
							</div>
							<div className='w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
								<div 
									className='h-full bg-purple-600 transition-all duration-150 ease-out'
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
						</div>
					)}

					<div className='flex items-center justify-between gap-4 w-full'>
						<p className='text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block'>
							Review all parameters before publishing your video to the community.
						</p>

						<div className='flex items-center gap-3 w-full sm:w-auto justify-end'>
							<Button
								type='submit'
								disabled={!isDirty || isPublishingVideo}
								title={isPublishingVideo ? `Uploading (${uploadProgress}%)...` : isDirty ? 'Fill Required Fields' : 'Publish Video'}
								fullWidth={false}
								className='px-6'
							>
								{isPublishingVideo ? (
									<>
										<Loader2 size={16} className='animate-spin' />
										<span>Uploading ({uploadProgress}%)</span>
									</>
								) : (
									'Publish Video'
								)}
							</Button>
						</div>
					</div>
				</div>
			</form>
		</div>
	)
}

export default StudioCreator