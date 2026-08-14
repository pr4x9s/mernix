import { useForm, type SubmitHandler } from 'react-hook-form'
import { useLogin } from '../hooks/useLogin.ts'
import { loginUserSchema, type LoginFormData  } from '../validators/auth.validator.ts'
import { Link } from 'react-router'
import { AtSign, Eye, EyeOff, Loader2, Lock, Video } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button, Input } from '../components/common/index.ts'



const Login = () => {
	const { mutate: loginUser, isPending } = useLogin();

	const [showPassword, setShowPassword] = useState(false);

	const { register, handleSubmit, setFocus, formState: { errors } } = useForm<LoginFormData>({
		resolver: zodResolver(loginUserSchema),
		mode: 'onTouched'
	});

	const onSubmit: SubmitHandler<LoginFormData> = (data) => {
		loginUser(data);
	};


	return (
		<>
			<title>Login | Mernix</title>

			<section className='flex items-center justify-center min-h-screen p-4 text-zinc-900 dark:text-white bg-white dark:bg-zinc-950'>
				<div className='w-full max-w-md p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl'>
					<div className='text-center mb-8'>
						<Link to='/' className='size-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40 rotate-3 hover:rotate-0 transition-all duration-300'>
							<Video className='text-white fill-current' size={32} />
						</Link>
						<h2 className='text-3xl font-bold tracking-tight'>
							Sign In
						</h2>
						<p className='text-zinc-500 dark:text-zinc-400 mt-2'>
							Welcome back to Mernix
						</p>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-5'
					>
						<Input 
							label='Username or Email'
							type='text'
							placeholder='username or email'
							title='Username or Email'
							leftIcon={
								<AtSign 
									className='size-4 cursor-pointer'
									onClick={() => setFocus('userIdentity')}
								/>
							}
							error={errors.userIdentity?.message}
							isOptionalField={false}
							{...register('userIdentity')}
						/>

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

						<Button 
							type='submit'
							disabled={isPending}
							title={isPending ? 'Authenticating...' : 'Sign In'}
							className={`mt-8 mb-5 ${isPending ? 'active:scale-none' : ''}`}
						>
							{isPending ? (
								<>
									<Loader2 className='animate-spin' size={18} />
									<span>Authenticating...</span>
								</>
							) : (
								'Sign In'
							)}
						</Button>
					</form>

					<div className='mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center'>
						<p className='text-sm text-zinc-500'>
							Don't have an account?{' '}
							<Link
								to='/register'
								className='text-purple-600 hover:underline font-semibold'
							>
								Create Account
							</Link>
						</p>
					</div>
				</div>
			</section>
		</>
	)
}

export default Login