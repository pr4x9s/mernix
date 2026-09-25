import clsx from 'clsx'
import { useId, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react'


interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	textLength?: number
	leftIcon?: ReactNode
	rightElement?: ReactNode
	error?: string
	containerClassName?: string
	isOptionalField?: boolean
	ref?: Ref<HTMLTextAreaElement>
}

const Textarea = ({
	label,
	textLength,
	maxLength,
	rows,
	leftIcon,
	rightElement,
	error,
	className = '',
	containerClassName = '',
	isOptionalField = false,
	id,
	ref,
	...props
}: TextareaProps) => {

	const generatedId = useId();
	const inputId = id ?? generatedId;

	const iconPosition = 'absolute top-1/5 -translate-y-1/2 flex items-center justify-center';

	return (
		<div className={clsx('w-full', containerClassName)}>
			<div className='flex justify-between items-center text-xs'>
				{label && (
					<label
						htmlFor={inputId}
						className='block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1'
					>
						{label}{' '}
						{isOptionalField ? null : (
							<span className='text-red-500'>*</span>
						)}
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
					<span
						className={clsx(
							iconPosition,
							'left-3 text-zinc-400 dark:text-zinc-600',
						)}
					>
						{leftIcon}
					</span>
				)}

				<textarea
					id={inputId}
					ref={ref}
					rows={rows}
					maxLength={maxLength}
					className={clsx(
						`w-full py-3 rounded-xl text-sm border bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-hidden focus:ring-2 transition-colors resize-none`,
						leftIcon ? 'pl-9 pr-4' : 'px-4',
						rightElement ? 'pr-11' : 'pr-4',
						error
							? 'border-red-500/50 focus:ring-red-500 hover:border-red-500 dark:bg-red-950/10'
							: 'border-slate-200 dark:border-slate-800 focus:ring-blue-500 hover:border-blue-400',
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

export default Textarea