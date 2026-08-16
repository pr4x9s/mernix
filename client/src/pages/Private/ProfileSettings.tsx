import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import AvatarEditor, { type AvatarEditorRef } from 'react-avatar-editor'
import { useAuthStore } from '../../store/authStore.ts'
import { useUpdateSettings } from '../../hooks/useUpdateSettings.ts'
import { useChangePassword } from '../../hooks/useChangePassword.ts'
import type { TabItems } from '../../types/types.ts'
import { updateAccountDetailsSchema, changeCurrentPasswordSchema, type UpdateAccountDetailsFormData, type ChangeCurrentPasswordFormData, singleAvatarUpdateSchema, singleCoverImageUpdateSchema } from '../../validators/auth.validator.ts'
import { Input, Button } from '../../components/common/index.ts'
import { User, Key, UserCircle, Camera, Loader2, Mail, X, ZoomIn, ZoomOut, Lock, Eye, EyeOff } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'


type Tabs = 'account' | 'branding' | 'security';

const ProfileSettings = () => {

	const currentUser = useAuthStore((state) => state.user);
	const [searchParams, setSearchParams] = useSearchParams();

	const validTabs: Tabs[] = ['account', 'branding', 'security'];

	const tabParam = searchParams.get('tab') as Tabs;

	const activeTab = validTabs.includes(tabParam) ? tabParam : 'account';

	const tabItems: TabItems<Tabs> = [
        {
            id: 'account',
            name: 'Account Info',
            icon: User
        },
        {
            id: 'branding',
            name: 'Branding Assets',
            icon: UserCircle
        },
        {
            id: 'security',
            name: 'Password & Security',
            icon: Key
        }
    ];

	const { updateDetails, isUpdatingDetails, updateAvatar, isUpdatingAvatar, updateCoverImage, isUpdatingCoverImage } = useUpdateSettings();

	const { changePassword, isChangingPassword, resetMutation } = useChangePassword();

	// Password toggle state
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Refs
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const coverInputRef = useRef<HTMLInputElement>(null);
	const editorRef = useRef<AvatarEditorRef>(null);

	// Image modal state
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadType, setUploadType] = useState<'avatar' | 'coverImage' | null>(null);
	const [zoom, setZoom] = useState<number>(1.2);

	// Account Form setup
	const {
		register: registerAccount,
		handleSubmit: handleAccountSubmit,
		setFocus: setAccountFocus,
		formState: { errors: accountErrors },
		reset: resetAccountForm,
	} = useForm<UpdateAccountDetailsFormData>({
		resolver: zodResolver(updateAccountDetailsSchema),
		mode: 'onTouched',
		defaultValues: {
			firstName: currentUser?.firstName || '',
			lastName: currentUser?.lastName || '',
			email: currentUser?.email || '',
		},
	});

	// Password Form setup
	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		setFocus: setPasswordFocus,
		formState: { errors: passwordErrors },
		reset: resetPasswordForm,
	} = useForm<ChangeCurrentPasswordFormData>({
		resolver: zodResolver(changeCurrentPasswordSchema),
		mode: 'onTouched',
	});

	// Sync current user details
	useEffect(() => {
		if (currentUser) {
			resetAccountForm({
				firstName: currentUser.firstName,
				lastName: currentUser.lastName,
				email: currentUser.email,
			});
		}
	}, [currentUser, resetAccountForm]);

	// tab handler utility
    const handleTabChange = (tabName: string) => {
		setSearchParams({ tab: tabName });
		resetMutation();
	};

	// stage the selected image into the local UI state modal
	const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverImage') => {
		const file = e.target.files?.[0];
		if (!file) return;

		const schema = type === 'avatar' ? singleAvatarUpdateSchema : singleCoverImageUpdateSchema;

		const result = schema.safeParse({ [type]: file });

		if (!result.success) {
			const errorMessage = result.error.issues[0]?.message;
			toast.error(errorMessage);

			e.target.value = '';
			return;
		}

		setSelectedFile(file);
		setUploadType(type);
		setZoom(1.2);
	};

	// extract the scaled pixels directly from the reference object and trigger upload mutations
    const handleSaveCrop = () => {
        if (!editorRef.current || !uploadType) return;

        editorRef.current.getImageScaledToCanvas().toBlob((blob: Blob | null) => {
            if (!blob) {
                toast.error('Failed to parse your image boundaries');
                return;
            }

            const cleanCroppedFile = new File([blob], `${uploadType}.jpeg`, { type: 'image/jpeg' });

            const formData = new FormData();

            formData.append(uploadType, cleanCroppedFile);

            if (uploadType === 'avatar') {
                updateAvatar(formData);
            }
            else {
                updateCoverImage(formData);
            }

            handleCloseModal();
        }, 'image/jpeg', 1.0);
    };

	const handleCloseModal = () => {
		setSelectedFile(null);
		setUploadType(null);
		if (avatarInputRef.current) avatarInputRef.current.value = '';
		if (coverInputRef.current) coverInputRef.current.value = '';
	};

	const onAccountSubmit = (data: UpdateAccountDetailsFormData) => updateDetails(data);

	const onPasswordSubmit = (data: ChangeCurrentPasswordFormData) => {
		changePassword(
			{
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
				confirmNewPassword: data.confirmNewPassword
            },
			{
				onSuccess: () => resetPasswordForm(),
			}
		);
	};

	return (
		<>
			<title>Dashboard Settings | Mernix</title>

			<div className='max-w-6xl mx-auto px-4 md:px-8 py-10 w-full text-zinc-950 dark:text-zinc-50 duration-200'>
				<h1 className='text-2xl md:text-3xl font-extrabold tracking-tight mb-2'>
					Account Control Settings
				</h1>
				<p className='text-sm text-zinc-500 dark:text-zinc-400 mb-8'>
					Manage your public identity, security credentials, and branding configurations.
				</p>

				<div className='flex flex-col lg:flex-row gap-8 items-start'>
					{/* LEFT SIDEBAR CONTROLS */}
					<aside className='flex flex-row lg:flex-col gap-2 w-full lg:w-64 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 border-b lg:border-b-0 border-zinc-200 dark:border-zinc-800 shrink-0 select-none scrollbar-none'>
						{tabItems.map((tab) => {
							const isSelected = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									type='button'
									onClick={() => handleTabChange(tab.id)}
									className={`px-4 py-3 text-xs md:text-sm font-semibold tracking-wide flex items-center gap-2 relative transition-colors duration-200 cursor-pointer whitespace-nowrap rounded-xl ${
										isSelected
											? 'bg-purple-600 text-white shadow-lg'
											: 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
									}`}
									title={tab.name}
									role='radio'
								>
									<tab.icon size={18} />
									<span>{tab.name}</span>
								</button>
							);
						})}
					</aside>

					{/* RIGHT PANEL DISPLAY SLATE */}
					<main className='flex-1 w-full bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-6 md:p-8 shadow-sm min-h-112.5'>
						{/* ACCOUNT SECTION */}
						{activeTab === 'account' && (
							<form
								onSubmit={handleAccountSubmit(onAccountSubmit)}
								className='space-y-6 max-w-xl'
							>
								<div>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
										Personal Information
									</h3>
									<p className='text-xs text-zinc-500 dark:text-zinc-400'>
										Update your basic identity endpoints below.
									</p>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<Input
										label='First Name'
										type='text'
										title='First Name'
										placeholder='First Name'
										leftIcon={
											<User
												className='size-4 cursor-pointer'
												onClick={() => setAccountFocus('firstName')}
											/>
										}
										error={accountErrors.firstName?.message}
										isOptionalField={false}
										{...registerAccount('firstName')}
									/>

									<Input
										label='Last Name'
										type='text'
										title='Last Name'
										placeholder='Last Name'
										leftIcon={
											<User
												className='size-4 cursor-pointer'
												onClick={() => setAccountFocus('lastName')}
											/>
										}
										error={accountErrors.lastName?.message}
										isOptionalField={false}
										{...registerAccount('lastName')}
									/>
								</div>

								<Input
									label='Email Address'
									type='email'
									title='Email Address'
									placeholder='Email Address'
									leftIcon={
										<Mail
											className='size-4 cursor-pointer'
											onClick={() => setAccountFocus('email')}
										/>
									}
									error={accountErrors.email?.message}
									isOptionalField={false}
									{...registerAccount('email')}
								/>

								<Button
									type='submit'
									disabled={isUpdatingDetails}
									title={isUpdatingDetails ? 'Saving...' : 'Save Changes'}
									fullWidth={false}
								>
									{isUpdatingDetails ? (
										<>
											<Loader2 size={16} className='animate-spin' />
											<span>Saving...</span>
										</>
									) : (
										'Save Changes'
									)}
								</Button>
							</form>
						)}

						{/* BRANDING ASSETS SECTION */}
						{activeTab === 'branding' && (
							<div className='space-y-8'>
								<div>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
										Channel Branding
									</h3>
									<p className='text-xs text-zinc-500 dark:text-zinc-400'>
										Upload customized branding media straight to your workspace channel profile.
									</p>
								</div>

								<input
									type='file'
									ref={avatarInputRef}
									onChange={(e) => handleFileSelect(e, 'avatar')}
									accept='image/*'
									className='hidden'
								/>
								<input
									type='file'
									ref={coverInputRef}
									onChange={(e) => handleFileSelect(e, 'coverImage')}
									accept='image/*'
									className='hidden'
								/>

								{/* COVER BANNER VIEW WINDOW */}
								<div className='space-y-3 max-w-2xl'>
									<span className='block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1'>
										Channel Cover Banner
									</span>
									<div className='w-full aspect-6/1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800/80 group'>
										{currentUser?.coverImage ? (
											<img
												src={currentUser.coverImage}
												className='size-full object-cover group-hover:brightness-50 transition-all duration-300 select-none'
												alt={`${currentUser.firstName}'s banner`}
											/>
										) : (
											<div className='size-full bg-linear-to-r from-purple-900/20 via-zinc-900 to-zinc-900 group-hover:brightness-50 transition-all duration-300' />
										)}
										<div
											onClick={() => !isUpdatingCoverImage && coverInputRef.current?.click()}
											className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 bg-black/40 text-white font-medium text-xs cursor-pointer transition-opacity duration-300'
											title='Change Banner'
										>
											{isUpdatingCoverImage ? (
												<Loader2 size={20} className='animate-spin' />
											) : (
												<>
													<Camera size={20} /> Change Banner
												</>
											)}
										</div>
									</div>
									<p className='text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-1'>
										Recommended aspect ratio <span className='font-semibold'>6:1</span> • Max size <span className='font-semibold'>200KB</span>
									</p>
								</div>

								{/* AVATAR DISPLAY PROFILE WINDOW */}
								<div className='space-y-3'>
									<span className='block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1'>
										Display Avatar
									</span>
									<div className='relative size-28 sm:size-32 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md bg-zinc-100 dark:bg-zinc-800 group'>
										{currentUser?.avatar ? (
											<img
												src={currentUser.avatar}
												className='size-full object-cover group-hover:brightness-50 transition-all duration-300 select-none'
												alt={`${currentUser.firstName}'s Avatar`}
											/>
										) : (
											<div className='size-full flex items-center justify-center text-zinc-400'>
												<User size={36} />
											</div>
										)}
										<div
											onClick={() => !isUpdatingAvatar && avatarInputRef.current?.click()}
											className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 bg-black/40 text-white text-xs cursor-pointer transition-opacity duration-300'
											title='Change Avatar'
										>
											{isUpdatingAvatar ? (
												<Loader2 size={20} className='animate-spin' />
											) : (
												<>
													<Camera size={18} /> Change Avatar
												</>
											)}
										</div>
									</div>
									<p className='text-[11px] text-zinc-500 dark:text-zinc-400 font-medium ml-1'>
										Recommended aspect ratio <span className='font-semibold'>1:1</span> • Max size <span className='font-semibold'>200KB</span>
									</p>
								</div>
							</div>
						)}

						{/* SECURITY PANEL */}
						{activeTab === 'security' && (
							<form
								onSubmit={handlePasswordSubmit(onPasswordSubmit)}
								className='space-y-6 max-w-xl'
							>
								<div>
									<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
										Update Password
									</h3>
									<p className='text-xs text-zinc-500 dark:text-zinc-400'>
										Ensure your workspace session remains robustly secure under strong authentication layers.
									</p>
								</div>

								<Input
									label='Current Password'
									type={showOldPassword ? 'text' : 'password'}
									title='Current Password'
									placeholder='••••••••'
									leftIcon={
										<Lock
											className='size-4 cursor-pointer'
											onClick={() => setPasswordFocus('oldPassword')}
										/>
									}
									rightElement={
										<button
											type='button'
											onClick={() => setShowOldPassword(!showOldPassword)}
											className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center'
											title={showOldPassword ? 'Hide password' : 'Show password'}
										>
											{showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									}
									error={passwordErrors.oldPassword?.message}
									isOptionalField={false}
									{...registerPassword('oldPassword')}
								/>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<Input
										label='New Password'
										type={showNewPassword ? 'text' : 'password'}
										title='New Password'
										placeholder='••••••••'
										leftIcon={
											<Lock
												className='size-4 cursor-pointer'
												onClick={() => setPasswordFocus('newPassword')}
											/>
										}
										rightElement={
											<button
												type='button'
												onClick={() => setShowNewPassword(!showNewPassword)}
												className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center'
												title={showNewPassword ? 'Hide password' : 'Show password'}
											>
												{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										}
										error={passwordErrors.newPassword?.message}
										isOptionalField={false}
										{...registerPassword('newPassword')}
									/>

									<Input
										label='Confirm New Password'
										type={showConfirmPassword ? 'text' : 'password'}
										title='Confirm New Password'
										placeholder='••••••••'
										leftIcon={
											<Lock
												className='size-4 cursor-pointer'
												onClick={() => setPasswordFocus('confirmNewPassword')}
											/>
										}
										rightElement={
											<button
												type='button'
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center'
												title={showConfirmPassword ? 'Hide password' : 'Show password'}
											>
												{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										}
										error={passwordErrors.confirmNewPassword?.message}
										isOptionalField={false}
										{...registerPassword('confirmNewPassword')}
									/>
								</div>

								<Button
									type='submit'
									disabled={isChangingPassword}
									title={isChangingPassword ? 'Updating...' : 'Update Password'}
									fullWidth={false}
								>
									{isChangingPassword ? (
										<>
											<Loader2 size={16} className='animate-spin' />
											<span>Updating...</span>
										</>
									) : (
										'Update Password'
									)}
								</Button>
							</form>
						)}
					</main>
				</div>
			</div>

			{/* CROPPER MODAL FRAME */}
			{selectedFile && uploadType && (
				<div className='fixed inset-0 z-999 flex items-center justify-center p-4 animate-in fade-in duration-150 select-none'>
					<div
						className='absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-md transition-opacity'
						onClick={handleCloseModal}
					/>

					<div className='relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-all animate-in zoom-in-95 duration-150'>
						<div className='px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between'>
							<div>
								<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 capitalize leading-none'>
									Adjust Your {uploadType === 'avatar' ? 'Avatar' : 'Banner'}
								</h3>
								<p className='text-xs text-zinc-400 dark:text-zinc-500 mt-1.5'>
									Position or scale your image crop boundaries safely.
								</p>
							</div>

							<button
								type='button'
								onClick={handleCloseModal}
								className='p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full transition-colors cursor-pointer'
							>
								<X size={18} />
							</button>
						</div>

						<div className='flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/40 p-6 border-b border-zinc-100 dark:border-zinc-800/40 overflow-hidden min-h-80'>
							<AvatarEditor
								ref={editorRef}
								image={selectedFile}
								width={uploadType === 'avatar' ? 280 : 360}
								height={uploadType === 'avatar' ? 280 : 100}
								border={uploadType === 'avatar' ? 20 : 10}
								borderRadius={uploadType === 'avatar' ? 140 : 12}
								color={document.documentElement.classList.contains('dark') ? [9, 9, 11, 0.7] : [255, 255, 255, 0.7]}
								scale={zoom}
								rotate={0}
							/>
						</div>

						<div className='p-6 space-y-5 bg-white dark:bg-zinc-900/60'>
							<div className='flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950/60 px-4 py-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-500'>
								<button
									type='button'
									className='p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg transition-colors cursor-pointer'
									onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
									title='Zoom Out'
								>
									<ZoomOut size={16} />
								</button>
								<input
									type='range'
									min='1'
									max='3'
									step='0.01'
									value={zoom}
									onChange={(e) => setZoom(parseFloat(e.target.value))}
									className='w-full accent-purple-600 h-1 cursor-pointer bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none transition-all'
								/>
								<button
									type='button'
									className='p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg transition-colors cursor-pointer'
									onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
									title='Zoom In'
								>
									<ZoomIn size={16} />
								</button>
							</div>

							<div className='flex flex-col sm:flex-row items-center gap-2.5 sm:justify-end'>
								<button
									type='button'
									onClick={handleCloseModal}
									className='w-full sm:w-auto bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold px-5 py-3 rounded-xl text-xs transition-all cursor-pointer'
								>
									Cancel
								</button>
								<button
									type='button'
									disabled={isUpdatingAvatar || isUpdatingCoverImage}
									onClick={handleSaveCrop}
									className='w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold px-5 py-3 rounded-xl text-xs shadow-md shadow-purple-500/10 transition-all active:scale-[0.98] cursor-pointer min-w-32'
								>
									{isUpdatingAvatar || isUpdatingCoverImage ? (
										<Loader2 size={14} className='animate-spin' />
									) : (
										'Save Changes'
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default ProfileSettings