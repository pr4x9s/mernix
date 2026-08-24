import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { ConfirmationModalProps } from '../../types/types.ts'
import { Button } from './index.ts'



const ConfirmationModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	isPending = false,
}: ConfirmationModalProps) => {

	// lock body scroll when modal is active
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}
        else {
			document.body.style.overflow = 'unset';
		}
		
        return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
			{/* backdrop overlay */}
			<div
				onClick={!isPending ? onClose : undefined}
				className='fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300'
			/>

			{/* modal card */}
			<div className='bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative z-10 transform scale-100 transition-transform duration-200'>
				<button
					type='button'
					disabled={isPending}
					onClick={onClose}
					className='absolute top-2 right-2 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.90] group'
                    title='Close'
				>
					<X size={18} className='group-hover:rotate-90 transition ease-in duration-300' />
				</button>

				{/* header */}
				<div className='flex gap-4 items-start mt-2'>
					<div className='p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-500 shrink-0'>
						<AlertTriangle size={24} />
					</div>
					<div className='space-y-1.5 min-w-0'>
						<h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight'>
							{title}
						</h3>
						<p className='text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed'>
							{description}
						</p>
					</div>
				</div>

				{/* footer action btns container */}
				<div className='flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800'>
					<Button
						type='button'
						disabled={isPending}
						onClick={onClose}
						className='bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-white shadow-none'
                        title={cancelText}
						fullWidth={false}
					>
						{cancelText}
					</Button>
					<Button
						type='button'
						disabled={isPending}
						onClick={onConfirm}
						className='text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10 cursor-pointer'
                        title={isPending ? 'Processing...' : confirmText}
						fullWidth={false}
					>
						{isPending ?
							(
								<>
									<Loader2 className='animate-spin' size={18} />
									<span>Processing...</span>
								</>
							) : confirmText
						}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmationModal