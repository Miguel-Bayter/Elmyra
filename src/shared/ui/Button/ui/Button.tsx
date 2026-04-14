import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  isDisabled?: boolean;
  variant?: 'primary' | 'secondary' | 'calm' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

// Maps Elmyra semantic variants → DaisyUI btn modifier classes.
// danger uses btn-warning (warm amber/peach — never red, R7).
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-ghost border border-[rgba(45,37,32,0.12)]',
  calm: 'btn btn-secondary',
  danger: 'btn btn-warning',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg w-full',
};

export function Button({
  onClick,
  label,
  icon,
  isDisabled = false,
  variant = 'primary',
  size = 'md',
  'aria-label': ariaLabel,
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={ariaLabel ?? label}
      className={clsx(
        'gap-2',
        // Safe: variant and size are typed union props, never user input
        // eslint-disable-next-line security/detect-object-injection
        variantClasses[variant],
        // eslint-disable-next-line security/detect-object-injection
        sizeClasses[size],
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
}
