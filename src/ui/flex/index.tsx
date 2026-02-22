import React from 'react';

import { cn } from '../../utils/cn';

export interface FlexProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  flexDirection?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  flexWrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

const directionMap = {
  row: 'flex-row', 'row-reverse': 'flex-row-reverse',
  col: 'flex-col', 'col-reverse': 'flex-col-reverse',
};

const wrapMap = {
  wrap: 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse', nowrap: 'flex-nowrap',
};

const gapMap: Record<number, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12', 16: 'gap-16',
};

const alignMap = {
  start: 'items-start', center: 'items-center', end: 'items-end', 
  stretch: 'items-stretch', baseline: 'items-baseline',
};

const justifyMap = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
};

const Flex = React.forwardRef<HTMLElement, FlexProps>(
  ({ as: Component = 'div', flexDirection = 'row', flexWrap, gap, alignItems, justifyContent, className, ...props }, ref) => {
    
    const directionClass = flexDirection ? directionMap[flexDirection] : '';
    const wrapClass = flexWrap ? wrapMap[flexWrap] : '';
    const gapClass = typeof gap === 'number' ? gapMap[gap] : gap;
    const alignClass = alignItems ? alignMap[alignItems] : '';
    const justifyClass = justifyContent ? justifyMap[justifyContent] : '';

    return (
      <Component
        ref={ref}
        className={cn('flex', directionClass, wrapClass, gapClass, alignClass, justifyClass, className)}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';
export default Flex;