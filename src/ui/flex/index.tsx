import React from 'react';

import { cn } from '../../utils/cn';

// ============================================================================
// TIPAGENS COMPARTILHADAS
// ============================================================================
type AsProp = React.ElementType;

interface SharedFlexProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: AsProp;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// ASSINATURA 1: O CONTAINER (A Régua)
// ============================================================================
export interface FlexContainerProps extends SharedFlexProps {
  item?: false;
  // Tipagem estrita alinhada ao CSS original
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  // Bloqueio rigoroso
  grow?: never;
  shrink?: never;
  flex?: never;
  alignSelf?: never;
}

// ============================================================================
// ASSINATURA 2: O ITEM (O Bloco)
// ============================================================================
export interface FlexItemProps extends SharedFlexProps {
  item: true;
  grow?: 1 | 0 | true | false;
  shrink?: 1 | 0 | true | false;
  flex?: '1' | 'auto' | 'initial' | 'none';
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline';

  // Bloqueio rigoroso
  flexDirection?: never;
  flexWrap?: never;
  gap?: never;
  alignItems?: never;
  justifyContent?: never;
}

export type FlexProps = FlexContainerProps | FlexItemProps;

// ============================================================================
// MAPEAMENTO SEGURO PARA O TAILWIND (JIT)
// ============================================================================

const directionMap: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col', // Padrão CSS
  col: 'flex-col', // Fallback (Atalho Tailwind)
  'column-reverse': 'flex-col-reverse',
  'col-reverse': 'flex-col-reverse',
};

const wrapMap = { wrap: 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse', nowrap: 'flex-nowrap' };

const gapMap: Record<number, string> = {
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

const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' };
const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const growMap = { 1: 'grow', 0: 'grow-0', true: 'grow', false: 'grow-0' };
const shrinkMap = { 1: 'shrink', 0: 'shrink-0', true: 'shrink', false: 'shrink-0' };
const flexMap = { '1': 'flex-1', auto: 'flex-auto', initial: 'flex-initial', none: 'flex-none' };
const alignSelfMap = {
  auto: 'self-auto',
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
  stretch: 'self-stretch',
  baseline: 'self-baseline',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const Flex = React.forwardRef<HTMLElement, FlexProps>((props, ref) => {
  const { as: Component = 'div', className, item, ...rest } = props;

  // RENDERIZAÇÃO DO ITEM
  if (item) {
    const { grow, shrink, flex, alignSelf, ...itemProps } = rest as Omit<FlexItemProps, 'item'>;

    const growClass = grow !== undefined ? growMap[grow as keyof typeof growMap] : '';
    const shrinkClass = shrink !== undefined ? shrinkMap[shrink as keyof typeof shrinkMap] : '';
    const flexClass = flex ? flexMap[flex] : '';
    const alignSelfClass = alignSelf ? alignSelfMap[alignSelf] : '';

    return <Component ref={ref} className={cn(flexClass, growClass, shrinkClass, alignSelfClass, className)} {...itemProps} />;
  }

  // RENDERIZAÇÃO DO CONTAINER (PADRÃO)
  const { flexDirection = 'row', flexWrap, gap, alignItems, justifyContent, ...containerProps } = rest as Omit<FlexContainerProps, 'item'>;
  const directionClass = flexDirection ? directionMap[flexDirection] : '';
  const wrapClass = flexWrap ? wrapMap[flexWrap] : '';
  const gapClass = typeof gap === 'number' ? gapMap[gap] : gap;
  const alignClass = alignItems ? alignMap[alignItems] : '';
  const justifyClass = justifyContent ? justifyMap[justifyContent] : '';

  return (
    <Component
      ref={ref}
      className={cn('flex', directionClass, wrapClass, gapClass, alignClass, justifyClass, className)}
      {...containerProps}
    />
  );
});

Flex.displayName = 'Flex';
export default Flex;
