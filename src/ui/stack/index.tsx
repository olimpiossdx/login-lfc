import React from 'react';

import Flex, { type FlexProps } from '../flex';

// Omitimos flexDirection porque a própria essência do Stack é ser uma coluna
export interface StackProps extends Omit<FlexProps, 'flexDirection'> {
  // spacing atua como um alias semântico para gap, herdando a mesma tipagem de tokens
  spacing?: FlexProps['gap'];
}

const Stack = React.forwardRef<HTMLElement, StackProps>(({ spacing, gap, ...props }, ref) => {
  // Se o desenvolvedor passar spacing, usamos ele.
  // Se passar gap (herdado do Flex), usamos.
  // Se não passar nada, o padrão é 4 (token do Tailwind).
  const finalGap = spacing ?? gap ?? 4;

  return <Flex ref={ref} flexDirection="col" gap={finalGap} {...props} />;
});

Stack.displayName = 'Stack';
export default Stack;
