import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react'


type CommonProps = {
    children: ReactNode,
    className?: string;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
    children,
    type = 'button',
    className = '',
    ...props
}: ButtonProps) => {

    const baseClasses = 'w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-all active:scale-[0.99] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer';

    const hoverClasses = 'hover:bg-purple-700';

    const finalClass = clsx(baseClasses, hoverClasses, className);


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