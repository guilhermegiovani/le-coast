import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant =
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
};

const badgeVariants: Record<BadgeVariant, string> = {
    default: 'bg-secondary text-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    outline: 'border border-border bg-background text-foreground',
};

export function Badge({
    className,
    variant = 'default',
    ...props
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
                badgeVariants[variant],
                className,
            )}
            {...props}
        />
    );
}