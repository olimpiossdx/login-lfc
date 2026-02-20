import React from 'react';
import { cn } from '../../utils/cn';

// 1. Dicionários de Mapeamento (Substituem os ternários longos e confusos)
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

// 2. Prevenção de perda de classes no Tailwind: mapeamento dos gaps numéricos mais comuns
// Se precisar de gaps arbitrários maiores/quebrados, o desenvolvedor usa a prop `gapRaw`
const gapMap: Record<number, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
  5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12',
};

// 3. Tipagem Polimórfica Segura: Garante que as props nativas da tag escolhida (ex: onClick, type) funcionem
export type FlexProps<T extends React.ElementType> = {
  as?: T;
  inline?: boolean; // Adicionado: prop que estava sendo desestruturada mas não existia na interface
  direction?: keyof typeof directionMap;
  wrap?: boolean;
  gap?: keyof typeof gapMap; 
  gapRaw?: string;
  align?: keyof typeof alignMap;
  justify?: keyof typeof justifyMap;
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

// Hack de tipagem para o forwardRef funcionar perfeitamente com componentes polimórficos
type FlexComponent = <T extends React.ElementType = 'div'>(
  props: FlexProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
) => React.ReactElement | null;

const Flex: FlexComponent = React.forwardRef(
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
    
    // Resolve o bug do null/undefined e previne erro de interpolação do Tailwind
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
          className // O tailwind-merge (cn) aqui vai garantir que se você passar `h-full` num Flex de col, ele respeite!
        )}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

export default Flex;