import React from 'react';

import { cn } from '../../utils/cn';
import { parseResponsive, type Responsive } from '../../utils/responsive';

type AsProp = React.ElementType;

interface SharedFlexProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: AsProp;
  className?: string;
  children?: React.ReactNode;
}

// ----------------------------------------------------------------------
// MAPAS BASE
// ----------------------------------------------------------------------
const directionMap: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  col: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};
const wrapMap: Record<string, string> = { wrap: 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse', nowrap: 'flex-nowrap' };
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
const alignMap: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};
const justifyMap: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const growMap: Record<string, string> = { 1: 'grow', 0: 'grow-0', true: 'grow', false: 'grow-0' };
const shrinkMap: Record<string, string> = { 1: 'shrink', 0: 'shrink-0', true: 'shrink', false: 'shrink-0' };
const flexMap: Record<string, string> = { '1': 'flex-1', auto: 'flex-auto', initial: 'flex-initial', none: 'flex-none' };
const alignSelfMap: Record<string, string> = {
  auto: 'self-auto',
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
  stretch: 'self-stretch',
  baseline: 'self-baseline',
};

// ----------------------------------------------------------------------
// TIPAGENS RESPONSIVAS
// ----------------------------------------------------------------------
export interface FlexContainerProps extends SharedFlexProps {
  item?: false;
  flexDirection?: Responsive<'row' | 'row-reverse' | 'column' | 'column-reverse'>;
  flexWrap?: Responsive<'wrap' | 'wrap-reverse' | 'nowrap'>;
  gap?: Responsive<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16>;
  alignItems?: Responsive<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  justifyContent?: Responsive<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  grow?: never;
  shrink?: never;
  flex?: never;
  alignSelf?: never;
}

export interface FlexItemProps extends SharedFlexProps {
  item: true;
  grow?: Responsive<1 | 0 | true | false>;
  shrink?: Responsive<1 | 0 | true | false>;
  flex?: Responsive<'1' | 'auto' | 'initial' | 'none'>;
  alignSelf?: Responsive<'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  flexDirection?: never;
  flexWrap?: never;
  gap?: never;
  alignItems?: never;
  justifyContent?: never;
}

export type FlexProps = FlexContainerProps | FlexItemProps;

// ----------------------------------------------------------------------
// COMPONENTE
// ----------------------------------------------------------------------
const Flex = React.forwardRef<HTMLElement, FlexProps>((props, ref) => {
  const { as: Component = 'div', className, item, ...rest } = props;

  if (item) {
    const { grow, shrink, flex, alignSelf, ...itemProps } = rest as Omit<FlexItemProps, 'item'>;
    return (
      <Component
        ref={ref}
        className={cn(
          parseResponsive(flex, flexMap),
          parseResponsive(grow, growMap),
          parseResponsive(shrink, shrinkMap),
          parseResponsive(alignSelf, alignSelfMap),
          className,
        )}
        {...itemProps}
      />
    );
  }

  const { flexDirection = 'row', flexWrap, gap, alignItems, justifyContent, ...containerProps } = rest as Omit<FlexContainerProps, 'item'>;
  return (
    <Component
      ref={ref}
      className={cn(
        'flex',
        parseResponsive(flexDirection, directionMap),
        parseResponsive(flexWrap, wrapMap),
        parseResponsive(gap, gapMap),
        parseResponsive(alignItems, alignMap),
        parseResponsive(justifyContent, justifyMap),
        className,
      )}
      {...containerProps}
    />
  );
});

Flex.displayName = 'Flex';
export default Flex;
