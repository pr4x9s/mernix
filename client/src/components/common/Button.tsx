import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react'


type CommonProps = {
    children: ReactNode,
    className?: string;
    fullWidth?: boolean;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
    children,
    type = 'button',
    className = '',
    fullWidth = true,
    ...props
}: ButtonProps) => {

    const baseClasses = 'py-3.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm';

    const finalClass = clsx(baseClasses, fullWidth ? 'w-full' : 'w-auto', className);


	return (
        <button
            type={type}
            className={finalClass}
            {...props as ButtonHTMLAttributes<HTMLButtonElement>}
        >
            {children}
        </button>
    )
}

export default Button