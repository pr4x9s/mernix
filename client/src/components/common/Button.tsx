import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link, type LinkProps } from 'react-router'
import clsx from 'clsx'


type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md';

type CommonProps = {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
};

// HTML button props
type NativeButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
    ref?: Ref<HTMLButtonElement>;
    to?: never;
    href?: never;
};

// External <a> props
type ExternalAnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a';
    ref?: Ref<HTMLAnchorElement>;
    href: string;
    to?: never;
};

// React Router <Link> props
type RouterLinkProps = CommonProps & Omit<LinkProps, 'to'> & {
    as: 'link';
    ref?: Ref<HTMLAnchorElement>;
    to: string;
    href?: never;
};

export type ButtonProps = NativeButtonProps | ExternalAnchorProps | RouterLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 hover:shadow-purple-600/30 active:scale-[0.98]',
    secondary: 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-800 dark:text-slate-200 shadow-xs active:scale-[0.98]',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-2.5 text-xs rounded-lg gap-2',
    md: 'px-4 py-3.5 text-sm rounded-xl gap-2',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed select-none';

    const finalClass = clsx(
        baseClasses,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : 'w-auto',
        className,
    );

    // External <a> Link
    if (props.as === 'a') {
        const { as: _, href, ref, target = '_blank', rel = 'noreferrer', ...anchorProps } = props;
        return (
            <a
                ref={ref}
                href={href}
                target={target}
                rel={rel}
                className={finalClass}
                {...anchorProps}
            >
                {children}
            </a>
        );
    }

    // React Router Link
    if (props.as === 'link') {
        const { as: _, to, ref, ...linkProps } = props;
        return (
            <Link ref={ref} to={to} className={finalClass} {...linkProps}>
                {children}
            </Link>
        );
    }

    // Native HTML Button
    const { as: _, type = 'button', ref, ...buttonProps } = props;
    return (
        <button ref={ref} type={type} className={finalClass} {...buttonProps}>
            {children}
        </button>
    )
}

export default Button