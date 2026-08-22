import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore.ts'
import { Video, X } from 'lucide-react'
import { Button } from '../common/index.ts'



const LoginModal = () => {
	const { isLoginModalOpen, setLoginModalOpen } = useAuthStore();
	const navigate = useNavigate();

	if (!isLoginModalOpen) return null;

	const handleGoToFullLogin = () => {
		setLoginModalOpen(false);
		navigate('/login');
	};

	return (
		<div className='fixed inset-0 z-999 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-zinc-950/40 backdrop-blur-md transition-opacity'
				onClick={() => setLoginModalOpen(false)}
			/>

			{/* modal box */}
			<div className='relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl overflow-hidden p-8 text-center border border-zinc-200 dark:border-zinc-800'>
				<button
					type='button'
					onClick={() => setLoginModalOpen(false)}
					className='absolute right-5 top-5 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all disabled:opacity-50 rounded-full cursor-pointer active:scale-[0.90] group'
					title='Close'
				>
					<X size={20} className='group-hover:rotate-90 transition ease-in duration-300' />
				</button>

				<div className='size-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40 rotate-3'>
					<Video className='text-white fill-current' size={32} />
				</div>

				<h2 className='text-2xl font-bold mb-3 tracking-tight'>
					Want to binge?
				</h2>
				<p className='text-zinc-500 dark:text-zinc-400 mb-8 text-sm leading-relaxed'>
					Sign in to your account to watch videos, comment, and
					subscribe to creators.
				</p>

				<div className='flex flex-col gap-3'>
					<Button
						type='button'
						onClick={handleGoToFullLogin}
					>
						Sign in
					</Button>
					<Button
						type='button'
						onClick={() => setLoginModalOpen(false)}
						className='bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white shadow-zinc-500/20'
					>
						Maybe Later
					</Button>
				</div>

				<Link
					to='/register'
					className='mt-6 text-xs text-zinc-400 block'
					onClick={() => setLoginModalOpen(false)}
				>
					New here?{' '}
					<span className='text-purple-500 cursor-pointer hover:underline font-medium'>
						Create an account
					</span>
				</Link>
			</div>
		</div>
	)
}

export default LoginModal