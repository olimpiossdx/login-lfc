import React from 'react';

import { cn } from '../../utils/cn';

// ============================================================================
// TIPAGENS COMPARTILHADAS
// ============================================================================
type AsProp = React.ElementType;

interface SharedGridProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: AsProp;
  className?: string;
  children?: React.ReactNode;
}

// ============================================================================
// ASSINATURA 1: O CONTAINER (A Malha)
// ============================================================================
export interface GridContainerProps extends SharedGridProps {
  item?: false; // Define explicitamente que NÃO é um item
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  columnsMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  columnsLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  // Bloqueio rigoroso das propriedades de Item
  colSpan?: never;
  colSpanMd?: never;
  colSpanLg?: never;
  rowSpan?: never;
  alignSelf?: never;
  justifySelf?: never;
}

// ============================================================================
// ASSINATURA 2: O ITEM (A Peça)
// ============================================================================
export interface GridItemProps extends SharedGridProps {
  item: true; // Obriga a passar 'item' para liberar este escopo
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full';
  colSpanMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full';
  colSpanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full';
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto' | 'full';
  alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'auto';
  justifySelf?: 'start' | 'center' | 'end' | 'stretch' | 'auto';

  // Bloqueio rigoroso das propriedades de Container
  columns?: never;
  columnsMd?: never;
  columnsLg?: never;
  gap?: never;
  alignItems?: never;
  justifyContent?: never;
}

// O componente aceita UMA OU OUTRA assinatura, nunca uma mistura das duas.
export type GridProps = GridContainerProps | GridItemProps;

// ============================================================================
// MAPEAMENTO SEGURO PARA O TAILWIND (JIT)
// ============================================================================

// --- Mapas do Container ---
const columnsMap: Record<number, string> = {
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

const columnsMdMap: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};

const columnsLgMap: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12',
};

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

const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

// --- Mapas do Item ---
const colSpanMap: Record<string | number, string> = {
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

const colSpanMdMap: Record<string | number, string> = {
  auto: 'md:col-auto',
  full: 'md:col-span-full',
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const colSpanLgMap: Record<string | number, string> = {
  auto: 'lg:col-auto',
  full: 'lg:col-span-full',
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

const rowSpanMap: Record<string | number, string> = {
  auto: 'row-auto',
  full: 'row-span-full',
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6',
};

const alignSelfMap = { auto: 'self-auto', start: 'self-start', center: 'self-center', end: 'self-end', stretch: 'self-stretch' };
const justifySelfMap = {
  auto: 'justify-self-auto',
  start: 'justify-self-start',
  center: 'justify-self-center',
  end: 'justify-self-end',
  stretch: 'justify-self-stretch',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const Grid = React.forwardRef<HTMLElement, GridProps>((props, ref) => {
  const { as: Component = 'div', className, item, ...rest } = props;

  // RENDERIZAÇÃO DO ITEM
  if (item) {
    const { colSpan, colSpanMd, colSpanLg, rowSpan, alignSelf, justifySelf, ...itemProps } = rest as Omit<GridItemProps, 'item'>;

    const colClass = colSpan ? colSpanMap[colSpan] : '';
    const mdColClass = colSpanMd ? colSpanMdMap[colSpanMd] : '';
    const lgColClass = colSpanLg ? colSpanLgMap[colSpanLg] : '';
    const rowClass = rowSpan ? rowSpanMap[rowSpan] : '';
    const alignSelfClass = alignSelf ? alignSelfMap[alignSelf] : '';
    const justifySelfClass = justifySelf ? justifySelfMap[justifySelf] : '';

    return (
      <Component
        ref={ref}
        className={cn(colClass, mdColClass, lgColClass, rowClass, alignSelfClass, justifySelfClass, className)}
        {...itemProps}
      />
    );
  }

  // RENDERIZAÇÃO DO CONTAINER (PADRÃO)
  const { columns, columnsMd, columnsLg, gap, alignItems, justifyContent, ...containerProps } = rest as Omit<GridContainerProps, 'item'>;

  const colClass = columns ? columnsMap[columns] : '';
  const mdColClass = columnsMd ? columnsMdMap[columnsMd] : '';
  const lgColClass = columnsLg ? columnsLgMap[columnsLg] : '';
  const gapClass = typeof gap === 'number' ? gapMap[gap] : gap;
  const alignClass = alignItems ? alignMap[alignItems] : '';
  const justifyClass = justifyContent ? justifyMap[justifyContent] : '';

  return (
    <Component
      ref={ref}
      className={cn('grid', colClass, mdColClass, lgColClass, gapClass, alignClass, justifyClass, className)}
      {...containerProps}
    />
  );
});

Grid.displayName = 'Grid';
export default Grid;
