import {
    type InputHTMLAttributes,
    useId,
} from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
}

export function Input({
    id,
    label,
    helperText,
    error,
    className,
    disabled,
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const descriptionId =
        error || helperText ? `${inputId}-description` : undefined;

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-foreground"
                >
                    {label}
                </label>
            )}

            <input
                id={inputId}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={descriptionId}
                className={cn(
                    [
                        'h-10 w-full rounded-lg border bg-background px-3 py-2',
                        'text-sm text-foreground',
                        'placeholder:text-muted',
                        'outline-none transition-colors duration-200',
                        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error
                            ? 'border-error focus:border-error focus:ring-error/20'
                            : 'border-border',
                    ],
                    className,
                )}
                {...props}
            />

            {(error || helperText) && (
                <p
                    id={descriptionId}
                    className={cn(
                        'text-sm',
                        error ? 'text-error' : 'text-muted',
                    )}
                >
                    {error ?? helperText}
                </p>
            )}
        </div>
    );
}