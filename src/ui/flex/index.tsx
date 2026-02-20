import React from 'react';
import { cn } from '../../utils/cn';

const directionMap = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const gapMap: Record<number, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
};

// Usamos Omit para evitar conflitos de tipagem entre nossas props e as props nativas do HTML
export type FlexProps<T extends React.ElementType> = {
  as?: T;
  inline?: boolean;
  direction?: keyof typeof directionMap;
  wrap?: boolean;
  gap?: keyof typeof gapMap;
  gapRaw?: string;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'direction' | 'wrap' | 'align' | 'justify' | 'className'>;

export type FlexComponent = <T extends React.ElementType = 'div'>(
  props: FlexProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
) => React.ReactElement | null;

// Criamos o componente interno sem tipar a variável diretamente
const FlexInner = React.forwardRef(
  <T extends React.ElementType = 'div'>(
    {
      as,
      inline,
      direction = 'row',
      wrap = false,
      gap,
      gapRaw,
      align,
      justify,
      className,
      ...props
    }: FlexProps<T>,
    ref: React.ForwardedRef<any>
  ) => {
    const Comp = as || 'div';
    const base = inline ? 'inline-flex' : 'flex';
    const finalGapClass = gapRaw || (gap !== undefined ? gapMap[gap] : '');

    return (
      <Comp
        ref={ref}
        className={cn(
          base,
          directionMap[direction],
          wrap ? 'flex-wrap' : 'flex-nowrap',
          finalGapClass,
          align && alignMap[align],
          justify && justifyMap[justify],
          className
        )}
        {...props}
      />
    );
  }
);

FlexInner.displayName = 'Flex';

// O "pulo do gato": aplicamos a tipagem polimórfica aqui
const Flex = FlexInner as FlexComponent;

export default Flex;