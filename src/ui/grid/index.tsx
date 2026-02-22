import React from 'react';

import { cn } from '../../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  columnsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  columnsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | string; 
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const columnsMap: Record<number, string> = {
  1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4',
  5: 'grid-cols-5', 6: 'grid-cols-6', 7: 'grid-cols-7', 8: 'grid-cols-8',
  9: 'grid-cols-9', 10: 'grid-cols-10', 11: 'grid-cols-11', 12: 'grid-cols-12',
};

const columnsMdMap: Record<number, string> = {
  1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4',
  5: 'md:grid-cols-5', 6: 'md:grid-cols-6', 7: 'md:grid-cols-7', 8: 'md:grid-cols-8',
  9: 'md:grid-cols-9', 10: 'md:grid-cols-10', 11: 'md:grid-cols-11', 12: 'md:grid-cols-12',
};

const columnsLgMap: Record<number, string> = {
  1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7', 8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9', 10: 'lg:grid-cols-10', 11: 'lg:grid-cols-11', 12: 'lg:grid-cols-12',
};

const gapMap: Record<number, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12', 16: 'gap-16',
};

const alignMap = {
  start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
};

const Grid = React.forwardRef<HTMLElement, GridProps>(
  ({ as: Component = 'div', columns, columnsMd, columnsLg, gap, alignItems, justifyContent, className, ...props }, ref) => {
    
    const colClass = columns ? columnsMap[columns] : '';
    const mdColClass = columnsMd ? columnsMdMap[columnsMd] : '';
    const lgColClass = columnsLg ? columnsLgMap[columnsLg] : '';
    
    // Se gap for número, usa o mapa. Se for string (ex: "gap-x-4 gap-y-2"), usa direto.
    const gapClass = typeof gap === 'number' ? gapMap[gap] : gap;
    
    const alignClass = alignItems ? alignMap[alignItems] : '';
    const justifyClass = justifyContent ? justifyMap[justifyContent] : '';

    return (
      <Component
        ref={ref}
        className={cn('grid', colClass, mdColClass, lgColClass, gapClass, alignClass, justifyClass, className)}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';
export default Grid;