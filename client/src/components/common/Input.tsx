import clsx from 'clsx'
import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
	textLength?: number;
    leftIcon?: ReactNode;
    rightElement?: ReactNode;
    error?: string;
    containerClassName?: string;
    isOptionalField?: boolean;
    ref?: Ref<HTMLInputElement>;
}


const Input = ({
	label,
	textLength,
	maxLength,
	leftIcon,
	rightElement,
	error,
	className = '',
	containerClassName = '',
	isOptionalField = false,
	id,
	ref,
	...props
}: InputProps) => {

	const generatedId = useId();
	const inputId = id ?? generatedId;

	const iconPosition = 'absolute top-1/2 -translate-y-1/2 flex items-center justify-center';

	return (
		<div className={clsx('w-full', containerClassName)}>
			<div className='flex justify-between items-center text-xs'>
				{label && (
					<label
						htmlFor={inputId}
						className='block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1'
					>
						{label}{' '}{isOptionalField ? null : (<span className='text-red-500'>*</span>)}
					</label>
				)}

				{textLength !== undefined && (
					<span className='text-zinc-400 font-mono text-[11px]'>
						{textLength}/{maxLength}
					</span>
				)}
			</div>

			<div className='relative w-full'>
				{leftIcon && (
					<span className={clsx(iconPosition, 'left-3 text-zinc-400 dark:text-zinc-600')}>
						{leftIcon}
					</span>
				)}

				<input
					id={inputId}
					ref={ref}
					maxLength={maxLength}
					className={clsx(
						`w-full py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border outline-none focus:ring-2 transition-all shadow-sm text-sm`,
						leftIcon ? 'pl-9 pr-4' : 'px-4',
						rightElement ? 'pr-11' : 'pr-4',
						error
							? 'border-red-500/50 focus:ring-red-500 hover:border-red-500 dark:bg-red-950/10'
							: 'border-zinc-200 dark:border-zinc-800 focus:ring-blue-500 hover:border-blue-400',
						className,
					)}
					title={label}
					aria-label={label}
					{...props}
				/>

				{rightElement && (
					<div className={clsx(iconPosition, 'right-3')}>
						{rightElement}
					</div>
				)}
			</div>

			{error && (
				<p className='text-red-500 text-xs font-medium mt-1.5 ml-1'>
					{error}
				</p>
			)}
		</div>
	)
}

export default Input