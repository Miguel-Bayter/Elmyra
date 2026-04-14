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

// Each variant evokes its role — primary is the lavender brand,
// calm is mint (soothing action), danger is warm peach (never red, R7).
const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-lavender text-white hover:bg-lavender-dark shadow-sm shadow-lavender/30 focus-visible:ring-lavender',
  secondary:
    'bg-parchment-warm text-ink-secondary hover:bg-parchment-deep border border-[rgba(45,37,32,0.12)] focus-visible:ring-lavender/50',
  calm: 'bg-sage-mist text-sage-dark hover:bg-sage-light shadow-sm shadow-sage/20 focus-visible:ring-sage',
  danger:
    'bg-peach-mist text-warm-peach hover:bg-peach-light shadow-sm shadow-peach/20 focus-visible:ring-warm-peach',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3.5 py-1.5 text-sm min-h-[36px] rounded-xl',
  md: 'px-5 py-2.5 text-sm font-medium min-h-[44px] rounded-2xl',
  lg: 'px-6 py-3 text-base font-medium min-h-[52px] w-full rounded-2xl',
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
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment',
        // Safe: variant and size are typed union props, never user input
        // eslint-disable-next-line security/detect-object-injection
        variantClasses[variant],
        // eslint-disable-next-line security/detect-object-injection
        sizeClasses[size],
        isDisabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
}
