import { useState, type ChangeEvent } from 'react'
import { useRegister } from '../hooks/useRegister.ts'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link } from 'react-router'
import { AtSign, Camera, Eye, EyeOff, Loader2, Lock, Mail, User, Video } from 'lucide-react'
import { registerUserSchema, type RegisterFormData } from '../validators/auth.validator.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '../components/common/index.ts'



const Register = () => {
	
	const { mutate: registerUser, isPending } = useRegister();

	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [coverPreview, setCoverPreview] = useState<string | null>(null);

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const { register, handleSubmit, setValue, setFocus, formState: { errors } } = useForm<RegisterFormData>({
		resolver: zodResolver(registerUserSchema),
		mode: 'onTouched'
	});

	const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			setValue('avatar', file, { shouldValidate: true });
			setAvatarPreview(URL.createObjectURL(file));
		}
	};

	const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			setValue('coverImage', file, { shouldValidate: true });
			setCoverPreview(URL.createObjectURL(file));
		}
	};

	const onSubmit: SubmitHandler<RegisterFormData> = (data) => {
		const formData = new FormData();

		formData.append('firstName', data.firstName.trim());
		formData.append('lastName', data.lastName.trim());
		formData.append('username', data.username.toLowerCase().trim());
		formData.append('email', data.email.toLowerCase().trim());
		formData.append('password', data.password);
		formData.append('confirmPassword', data.confirmPassword);

		if (data.avatar) formData.append('avatar', data.avatar);
		if (data.coverImage) formData.append('coverImage', data.coverImage);

		registerUser(formData);
	};

	return (
		<>
			<title>Register | Mernix</title>

			<section className='flex items-center justify-center min-h-screen p-4 text-zinc-900 dark:text-white bg-white dark:bg-zinc-950'>
				<div className='w-full max-w-2xl bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden'>
					<div className='text-center my-8'>
						<Link
							to='/'
							className='size-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40 rotate-3 hover:rotate-0 transition-all duration-300'
							title='Home'
						>
							<Video
								className='text-white fill-current'
								size={32}
							/>
						</Link>
						<h2 className='text-3xl font-bold tracking-tight'>
							Create Account
						</h2>
						<p className='text-zinc-500 dark:text-zinc-400 mt-2'>
							Join the ultimate developer video streaming hub
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className='relative'>
							<div className='relative group h-32 md:h-44 w-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden'>
								{coverPreview ? (
									<img
										src={coverPreview}
										alt='Cover'
										className='size-full object-cover'
									/>
								) : (
									<div className='size-full flex items-center justify-center text-zinc-400 text-sm italic'>
										No cover image selected (Optional)
									</div>
								)}

								<label
									htmlFor='coverImage'
									className='absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-2 rounded-lg cursor-pointer transition-all opacity-80 group-hover:opacity-100 z-10'
									title='Upload cover image'
								>
									<Camera size={20} />
								</label>
								<input
									type='file'
									id='coverImage'
									accept='image/*'
									className='hidden'
									onChange={handleCoverChange}
								/>
							</div>

							<div className='absolute -bottom-10 left-8 size-24 md:size-32 rounded-full border-4 border-zinc-50 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-xl group/avatar'>
								{avatarPreview ? (
									<img
										src={avatarPreview}
										alt='Avatar'
										className='size-full object-cover'
									/>
								) : (
									<div className='size-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400'>
										<User
											size={48}
											strokeWidth={1.5}
											className={`opacity-50 ${errors.avatar ? 'text-red-500' : ''}`}
										/>
									</div>
								)}
								<label
									htmlFor='avatar'
									className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-all z-20 text-white'
									title='Upload avatar image'
								>
									<Camera />
								</label>
								<input
									type='file'
									id='avatar'
									accept='image/*'
									className='hidden'
									onChange={handleAvatarChange}
								/>
							</div>
						</div>

						<p className='text-right text-xs text-zinc-400 italic pl-36 pr-4 mt-2 leading-tight'>
							Max size for avatar & cover: <span className='font-semibold'>200KB</span>
						</p>

						<div className='mt-8 sm:mt-10 px-8 flex flex-col gap-1'>
							{errors.avatar && (
								<p className='text-red-500 text-xs font-medium'>
									{errors.avatar.message}
								</p>
							)}

							{errors.coverImage && (
								<p className='text-red-500 text-xs font-medium'>
									{errors.coverImage.message}
								</p>
							)}
						</div>
						
						<div className='p-8 pt-4'>
							<div className='mb-8'>
								<p className='text-zinc-500 dark:text-zinc-400 mt-1'>
									Fill in your details to get started.
								</p>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
								<Input 
									label='First Name'
									type='text'
									placeholder='John'
									title='First Name'
									leftIcon={
										<User 
											className='size-4 cursor-pointer'
											onClick={() => setFocus('firstName')}
										/>
									}
									error={errors.firstName?.message}
									isOptionalField={false}
									{...register('firstName')}
								/>
								
								<Input 
									label='Last Name'
									type='text'
									placeholder='Doe'
									title='Last Name'
									leftIcon={
										<User 
											className='size-4 cursor-pointer'
											onClick={() => setFocus('lastName')}
										/>
									}
									error={errors.lastName?.message}
									isOptionalField={false}
									{...register('lastName')}
								/>

								<Input 
									label='Username'
									type='text'
									placeholder='johndoe'
									title='Username'
									leftIcon={
										<AtSign 
											className='size-4 cursor-pointer'
											onClick={() => setFocus('username')}
										/>
									}
									error={errors.username?.message}
									isOptionalField={false}
									{...register('username')}
								/>

								<Input 
									label='Email'
									type='email'
									placeholder='john@example.com'
									title='Email'
									leftIcon={
										<Mail 
											className='size-4 cursor-pointer'
											onClick={() => setFocus('email')}
										/>
									}
									error={errors.email?.message}
									isOptionalField={false}
									{...register('email')}
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-5'>
								<Input
									label='Password'
									type={showPassword ? 'text' : 'password'}
									placeholder='••••••••'
									title='Password'
									leftIcon={
										<Lock
											className='size-4 cursor-pointer'
											onClick={() => setFocus('password')}
										/>
									}
									rightElement={
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer'
											title={showPassword ? 'Hide' : 'Show'}
										>
											{showPassword ? <EyeOff size={18} /> : <Eye size={18}/>}
										</button>
									}
									error={errors.password?.message}
									isOptionalField={false}
									{...register('password')}
								/>

								<Input
									label='Confirm Password'
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder='••••••••'
									title='Confirm Password'
									leftIcon={
										<Lock
											className='size-4 cursor-pointer'
											onClick={() => setFocus('confirmPassword')}
										/>
									}
									rightElement={
										<button
											type='button'
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className='text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer'
											title={showConfirmPassword ? 'Hide' : 'Show'}
										>
											{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18}/>}
										</button>
									}
									error={errors.confirmPassword?.message}
									isOptionalField={false}
									{...register('confirmPassword')}
								/>
							</div>

							<Button 
								type='submit'
								disabled={isPending}
								title={isPending ? 'Processing Registration...' : 'Create Account'}
								className={`mt-8 mb-5 ${isPending ? 'active:scale-none' : ''}`}
							>
								{isPending ? (
									<>
										<Loader2 className='animate-spin' size={18} />
										<span>Processing Registration...</span>
									</>
								) : (
									'Create Account'
								)}
							</Button>

							<div className='mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center'>
								<p className='text-sm text-zinc-500'>
									Already a member?{' '}
									<Link
										to='/login'
										className='text-purple-600 hover:underline font-semibold'
									>
										Sign In
									</Link>
								</p>
							</div>
						</div>
					</form>
				</div>
			</section>
		</>
	)
}

export default Register