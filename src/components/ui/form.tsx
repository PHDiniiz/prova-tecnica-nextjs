'use client';

import { cn } from '@/lib/utils';
import {
  useForm,
  UseFormReturn,
  FieldValues,
  Path,
  Controller,
  ControllerProps,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, ZodTypeAny } from 'zod';
import { HTMLAttributes, forwardRef, ReactNode } from 'react';

/**
 * Form Component
 * Wrapper para formulários com React Hook Form + Zod
 */

interface FormProps<T extends FieldValues> extends Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  schema: ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: (methods: UseFormReturn<T>) => ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  ...props
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)} {...props}>
      {children(methods)}
    </form>
  );
}

interface FormFieldProps<T extends FieldValues> {
  control: UseFormReturn<T>['control'];
  name: Path<T>;
  render: ControllerProps<T, Path<T>>['render'];
}

export function FormField<T extends FieldValues>({
  control,
  name,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  );
}

interface FormItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    );
  }
);

FormItem.displayName = 'FormItem';

interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, htmlFor, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          'text-sm font-medium text-gray-700 dark:text-gray-300',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500",
          className
        )}
        {...props}
      >
        {children}
      </label>
    );
  }
);

FormLabel.displayName = 'FormLabel';

interface FormControlProps {
  children: ReactNode;
}

export const FormControl = ({ children }: FormControlProps) => {
  return <>{children}</>;
};

interface FormDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormDescription.displayName = 'FormDescription';

interface FormErrorMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const FormErrorMessage = forwardRef<HTMLParagraphElement, FormErrorMessageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-red-600 dark:text-red-400', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

FormErrorMessage.displayName = 'FormErrorMessage';

