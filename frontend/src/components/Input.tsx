'use client';

import React from 'react';
import { Input as HeroUIInput } from '@heroui/react';

interface CustomInputProps extends React.ComponentPropsWithRef<typeof HeroUIInput> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isInvalid?: boolean;
  errorMessage?: React.ReactNode;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(({
  startContent,
  endContent,
  isInvalid,
  errorMessage,
  label,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-default-600">
          {label}
        </label>
      )}
      <div className={`relative flex items-center w-full rounded-xl border bg-default-50/50 dark:bg-default-800/20 px-3 transition-colors ${
        isInvalid 
          ? 'border-danger-500 focus-within:border-danger-500' 
          : 'border-default-200 focus-within:border-primary-500'
      }`}>
        {startContent && (
          <span className="mr-2.5 text-default-400 flex items-center flex-shrink-0">
            {startContent}
          </span>
        )}
        <HeroUIInput
          ref={ref}
          className={`w-full bg-transparent py-2.5 text-xs text-foreground placeholder-default-400 focus:outline-none focus:ring-0 ${className}`}
          {...props}
        />
        {endContent && (
          <span className="ml-2.5 text-default-400 flex items-center flex-shrink-0">
            {endContent}
          </span>
        )}
      </div>
      {isInvalid && errorMessage && (
        <p className="text-[10px] text-danger font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
