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
					<X size={20} className='group-hover:rotate-90 origin-center transition ease-in duration-300' />
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
                        variant='primary'
						fullWidth={true}
                        onClick={handleGoToFullLogin}
                        title='Sign in'
                        aria-label='Sign in'
						role='button'
					>
						Sign in
					</Button>
					<Button
                        type='button'
                        variant='secondary'
                        fullWidth={true}
						onClick={() => setLoginModalOpen(false)}
                        title='Maybe Later'
                        aria-label='Maybe Later'
						role='button'
					>
						Maybe Later
					</Button>
				</div>

                <p className='text-xs mt-6 text-zinc-400'>
                    New Here?{' '}
                    <Link
                        to='/register'
                        onClick={() => setLoginModalOpen(false)}
                        className='text-purple-500 cursor-pointer hover:underline font-medium'
                        title='Create an account'
                        aria-label='Create an account'
                        role='link'
                    >
                        Create an account
                    </Link>
                </p>
			</div>
		</div>
	)
}

export default LoginModal