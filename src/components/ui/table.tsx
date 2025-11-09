import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

/**
 * Table Component
 * Componente de tabela responsivo com variantes
 */

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'striped' | 'bordered';
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full border-collapse',
            variant === 'striped' && 'divide-y divide-gray-200 dark:divide-gray-700',
            variant === 'bordered' && 'border border-gray-200 dark:border-gray-700',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn('bg-gray-50 dark:bg-gray-800', className)}
      {...props}
    />
  );
});

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return <tbody ref={ref} className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)} {...props} />;
});

TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      className={cn('bg-gray-50 dark:bg-gray-800 font-medium', className)}
      {...props}
    />
  );
});

TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement> & {
    variant?: 'default' | 'hover';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-gray-200 dark:border-gray-700 transition-colors',
        variant === 'hover' && 'hover:bg-gray-50 dark:hover:bg-gray-800',
        className
      )}
      {...props}
    />
  );
});

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  return (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider',
        className
      )}
      {...props}
    />
  );
});

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<
  HTMLTableCellElement,
  HTMLAttributes<HTMLTableCellElement> & {
    colSpan?: number;
  }
>(({ className, colSpan, ...props }, ref) => {
  return (
    <td
      ref={ref}
      colSpan={colSpan}
      className={cn('px-4 py-3 text-sm text-gray-900 dark:text-gray-100', className)}
      {...props}
    />
  );
});

TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  );
});

TableCaption.displayName = 'TableCaption';

