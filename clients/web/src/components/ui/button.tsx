import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
    [
        'inline-flex items-center justify-center',
        'cursor-pointer',
        'rounded-lg',
        'font-semibold',
        'transition-all duration-200 ease-in-out',
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary',
        'focus-visible:ring-offset-2',
        'disabled:pointer-events-none',
        'disabled:opacity-50',
    ],
    {
        variants: {
            variant: {
                primary: 'bg-primary text-white hover:bg-primary/90',
                secondary:
                    'bg-secondary text-foreground hover:bg-secondary/80',
                outline:
                    'border border-border bg-background hover:bg-secondary',
                ghost: 'hover:bg-secondary',
                danger: 'bg-error text-white hover:bg-error/90',
            },

            size: {
                sm: 'h-9 px-4 text-sm',
                md: 'h-10 px-5 text-sm',
                lg: 'h-11 px-6 text-base',
                
                // Cria um botão quadrado para ações representadas apenas por ícones.
                icon: 'size-10 p-0',
            },
        },

        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

import type { ButtonHTMLAttributes } from 'react';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

export function Button({
    className,
    variant,
    size,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}