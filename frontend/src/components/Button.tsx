'use client';

import React from 'react';
import { Button as HeroUIButton } from '@heroui/react';
import Link from 'next/link';

interface CustomButtonProps extends React.ComponentPropsWithRef<typeof HeroUIButton> {
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'default';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isLoading?: boolean;
  onPress?: (e: any) => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  href?: string;
  as?: any;
}

const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(({
  children,
  color,
  radius,
  isLoading,
  className = '',
  variant,
  isDisabled,
  startContent,
  endContent,
  href,
  as,
  ...props
}, ref) => {
  let customClasses = '';
  let resolvedVariant = variant || 'primary';

  if (color) {
    if (color === 'primary') {
      resolvedVariant = 'primary';
    } else if (color === 'secondary') {
      resolvedVariant = 'secondary';
    } else if (color === 'danger') {
      resolvedVariant = 'danger';
    } else if (color === 'success') {
      resolvedVariant = 'primary';
      customClasses += ' bg-success-600 hover:bg-success-700 text-white border-success-600';
    } else if (color === 'warning') {
      resolvedVariant = 'primary';
      customClasses += ' bg-warning-500 hover:bg-warning-600 text-white border-warning-500';
    } else if (color === 'default') {
      resolvedVariant = 'ghost';
    }
  }

  if (radius) {
    if (radius === 'full') {
      customClasses += ' rounded-full';
    } else if (radius === 'xl') {
      customClasses += ' rounded-2xl';
    } else if (radius === 'lg') {
      customClasses += ' rounded-xl';
    } else if (radius === 'md') {
      customClasses += ' rounded-lg';
    } else if (radius === 'sm') {
      customClasses += ' rounded';
    } else if (radius === 'none') {
      customClasses += ' rounded-none';
    }
  }

  if (href) {
    let resolvedLinkClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none active:scale-95 ';
    if (resolvedVariant === 'primary') {
      resolvedLinkClasses += 'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/10';
    } else if (resolvedVariant === 'secondary') {
      resolvedLinkClasses += 'bg-secondary-500 text-white hover:bg-secondary-600';
    } else if (resolvedVariant === 'danger') {
      resolvedLinkClasses += 'bg-danger text-white hover:bg-danger-600';
    } else if (resolvedVariant === 'ghost') {
      resolvedLinkClasses += 'border border-default bg-transparent text-default-600 hover:bg-default-100 hover:text-foreground';
    } else {
      resolvedLinkClasses += 'bg-default text-default-foreground hover:bg-default-200';
    }

    const size = props.size || 'md';
    let sizeClasses = 'h-10 px-4 text-sm rounded-xl';
    if (size === 'sm') {
      sizeClasses = 'h-8 px-3 text-xs rounded-lg';
    } else if (size === 'lg') {
      sizeClasses = 'h-12 px-6 text-base rounded-2xl';
    }

    return (
      <Link
        href={href}
        className={`${resolvedLinkClasses} ${sizeClasses} ${customClasses} ${className}`}
        onClick={(e) => {
          if (props.onPress) {
            props.onPress(e);
          }
          if (props.onClick) {
            props.onClick(e);
          }
        }}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent flex-shrink-0" />
        )}
        {!isLoading && startContent && <span className="mr-1.5 flex items-center">{startContent}</span>}
        {typeof children === 'function' ? (children as any)({} as any) : children}
        {endContent && <span className="ml-1.5 flex items-center">{endContent}</span>}
      </Link>
    );
  }

  const buttonEl = (
    <HeroUIButton
      ref={ref}
      variant={resolvedVariant}
      isDisabled={isDisabled || isLoading}
      className={`${customClasses} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent flex-shrink-0" />
      )}
      {!isLoading && startContent && <span className="mr-1.5 flex items-center">{startContent}</span>}
      {typeof children === 'function' ? (children as any)({} as any) : children}
      {endContent && <span className="ml-1.5 flex items-center">{endContent}</span>}
    </HeroUIButton>
  );

  return buttonEl;
});

Button.displayName = 'Button';

export default Button;
