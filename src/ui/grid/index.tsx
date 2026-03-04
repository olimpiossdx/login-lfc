import React from 'react';

import { cn } from '../../utils/cn';
import { parseResponsive, type Responsive } from '../../utils/responsive';

type AsProp = React.ElementType;

interface SharedGridProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: AsProp;
  className?: string;
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------
// MAPAS BASE
// ----------------------------------------------------------------------
const colMap: Record<string, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
};
const gapMap: Record<string, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
  16: 'gap-16',
};
const alignMap: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
const justifyMap: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const colSpanMap: Record<string, string> = {
  auto: 'col-auto',
  full: 'col-span-full',
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};
const rowSpanMap: Record<string, string> = {
  auto: 'row-auto',
  full: 'row-span-full',
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6',
};
const alignSelfMap: Record<string, string> = {
  auto: 'self-auto',
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
  stretch: 'self-stretch',
};
const justifySelfMap: Record<string, string> = {
  auto: 'justify-self-auto',
  start: 'justify-self-start',
  center: 'justify-self-center',
  end: 'justify-self-end',
  stretch: 'justify-self-stretch',
};

// ----------------------------------------------------------------------
// TIPAGENS RESPONSIVAS
// ----------------------------------------------------------------------
export interface GridContainerProps extends SharedGridProps {
  item?: false;
  columns?: Responsive<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>;
  gap?: Responsive<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16>;
  alignItems?: Responsive<'start' | 'center' | 'end' | 'stretch'>;
  justifyContent?: Responsive<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  colSpan?: never;
  rowSpan?: never;
  alignSelf?: never;
  justifySelf?: never;
}

export interface GridItemProps extends SharedGridProps {
  item: true;
  colSpan?: Responsive<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full'>;
  rowSpan?: Responsive<1 | 2 | 3 | 4 | 5 | 6 | 'auto' | 'full'>;
  alignSelf?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'auto'>;
  justifySelf?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'auto'>;
  columns?: never;
  gap?: never;
  alignItems?: never;
  justifyContent?: never;
}

export type GridProps = GridContainerProps | GridItemProps;

// ----------------------------------------------------------------------
// COMPONENTE
// ----------------------------------------------------------------------
const Grid = React.forwardRef<HTMLElement, GridProps>((props, ref) => {
  const { as: Component = 'div', className, item, ...rest } = props;

  if (item) {
    const { colSpan, rowSpan, alignSelf, justifySelf, ...itemProps } = rest as Omit<GridItemProps, 'item'>;
    return (
      <Component
        ref={ref}
        className={cn(
          parseResponsive(colSpan, colSpanMap),
          parseResponsive(rowSpan, rowSpanMap),
          parseResponsive(alignSelf, alignSelfMap),
          parseResponsive(justifySelf, justifySelfMap),
          className,
        )}
        {...itemProps}
      />
    );
  }

  const { columns, gap, alignItems, justifyContent, ...containerProps } = rest as Omit<GridContainerProps, 'item'>;
  return (
    <Component
      ref={ref}
      className={cn(
        'grid',
        parseResponsive(columns, colMap),
        parseResponsive(gap, gapMap),
        parseResponsive(alignItems, alignMap),
        parseResponsive(justifyContent, justifyMap),
        className,
      )}
      {...containerProps}
    />
  );
});

Grid.displayName = 'Grid';
export default Grid;
