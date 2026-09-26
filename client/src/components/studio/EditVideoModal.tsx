import { useState, useEffect, type ChangeEvent } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import type { VideoFeedItem } from '../../types/types.ts'
import { useUpdateVideo } from '../../hooks/useVideoMutations.ts'
import { updateVideoPayloadSchema, type UpdateVideoFormData } from '../../validators/video.validator.ts'
import { Button, Input, Textarea } from '../../components/common/index.ts'

interface EditVideoModalProps {
	isOpen: boolean
	onClose: () => void
	cancelText?: string
	video: VideoFeedItem | null
}

const EditVideoModal = ({
	isOpen,
	onClose,
	cancelText = 'Cancel',
	video,
}: EditVideoModalProps) => {
	const { mutate: updateVideo, isPending: isUpdatingVideo } = useUpdateVideo()
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
		null,
	)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isDirty },
	} = useForm<UpdateVideoFormData>({
		resolver: zodResolver(updateVideoPayloadSchema),
		mode: 'onTouched',
		defaultValues: {
			title: video?.title || '',
			description: video?.description || '',
		},
	})

	const descriptionValue = watch('description') || ''

	useEffect(() => {
		if (video) {
			reset({
				title: video.title || '',
				description: video.description || '',
			})
			setThumbnailPreview(video.thumbnail || null)
		}
	}, [video, reset])

	const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]

		if (file) {
			setValue('thumbnail', file, {
				shouldValidate: true,
				shouldDirty: true,
			})
			setThumbnailPreview(URL.createObjectURL(file))
		}
	}

	const onSubmit: SubmitHandler<UpdateVideoFormData> = (data) => {
		if (!video?._id) return

		updateVideo(
			{
				videoId: video._id,
				payload: data,
			},
			{
				onSuccess: () => {
					onClose()
				},
			},
		)
	}

	if (!isOpen || !video) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            {/* backdrop overlay */}
            <div
				onClick={!isUpdatingVideo ? onClose : undefined}
				className='fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300'
			/>
            {/* modal card */}
			<div
				className='relative w-full max-w-xl max-h-[90dvh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden scrollbar-thumb-purple-600/20 dark:scrollbar-thumb-purple-400/20 scrollbar-thin'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header (Fixed / Non-scrolling) */}
				<div className='flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0'>
					<div>
						<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-none'>
							Edit Video Metadata
						</h3>
						<p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1.5'>
							Update your public video details and thumbnail
							preview below.
						</p>
					</div>

					<button
						type='button'
						onClick={onClose}
						disabled={isUpdatingVideo}
						className='absolute top-2 right-2 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.90] group'
						title='Close'
					>
						<X size={18} className='group-hover:rotate-90 origin-center transition ease-in duration-300' />
					</button>
				</div>

				{/* Form Wrap (Flex child that scrolls) */}
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='flex flex-col flex-1 overflow-hidden min-h-0'
				>
					{/* 2. Scrollable Body Window */}
					<div className='p-6 space-y-6 overflow-y-auto flex-1'>
						<Input
							label='Video Title'
							type='text'
							placeholder='Enter a catchy video title'
							title='Video Title'
							error={errors.title?.message}
							isOptionalField={false}
							{...register('title')}
						/>

						<Textarea
							label='Description'
							rows={4}
							placeholder='Tell viewers about your video'
							textLength={descriptionValue.length}
							maxLength={2000}
							disabled={isUpdatingVideo}
							error={errors.description?.message}
							isOptionalField={false}
                            className='scrollbar-thumb-purple-600/20 dark:scrollbar-thumb-purple-400/20 scrollbar-thin'
							{...register('description')}
						/>

						{/* Responsive Thumbnail Component */}
						<div className='space-y-2'>
							<span className='block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1'>
								Thumbnail Asset
							</span>

							<div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/80 w-full overflow-hidden'>
								<div className='relative w-full sm:w-44 shrink-0 aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-xs'>
									{thumbnailPreview ? (
										<img
											src={thumbnailPreview}
											alt='Thumbnail Preview'
											className='size-full object-cover'
											loading='lazy'
										/>
									) : (
										<div className='flex flex-col items-center gap-1 text-zinc-400'>
											<ImageIcon size={24} />
											<span className='text-[10px]'>
												No Image
											</span>
										</div>
									)}
								</div>

								<div className='flex flex-col items-start gap-2 w-full sm:w-auto min-w-0'>
									<label
										htmlFor='video-thumbnail-upload'
										className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
											isUpdatingVideo
												? 'opacity-50 pointer-events-none'
												: 'bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
										}`}
									>
										<Upload size={15} />
										<span>Change Thumbnail</span>
									</label>

									<input
										id='video-thumbnail-upload'
										type='file'
										accept='image/*'
										className='hidden'
										onChange={handleThumbnailChange}
										disabled={isUpdatingVideo}
									/>

									<p className='text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-0.5 sm:ml-1'>
										Aspect ratio{' '}
										<span className='font-semibold'>
											16:9
										</span>{' '}
										&bull; Max size{' '}
										<span className='font-semibold'>
											200KB
										</span>
									</p>
								</div>
							</div>

							{errors.thumbnail && (
								<p className='text-red-500 text-xs font-medium mt-1.5 ml-1'>
									{errors.thumbnail.message}
								</p>
							)}
						</div>
					</div>

					{/* 3. Sticky Modal Footer */}
					<div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0'>
						<Button
							type='button'
							onClick={onClose}
							disabled={isUpdatingVideo}
							className='bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-white shadow-none'
                            title={cancelText}
                            fullWidth={false}
						>
							{cancelText}
						</Button>

						<Button
							type='submit'
							disabled={!isDirty || isUpdatingVideo}
							title={
								isUpdatingVideo
									? 'Saving Changes...'
									: !isDirty
										? 'No Changes to Save'
										: 'Save Changes'
							}
							fullWidth={false}
						>
							{isUpdatingVideo ? (
								<>
									<Loader2
										size={16}
										className='animate-spin'
									/>
									<span>Saving Changes...</span>
								</>
							) : !isDirty ? (
								'No Changes to Save'
							) : (
								'Save Changes'
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default EditVideoModal