export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type Responsive<T> =
  | T
  | { [key in Breakpoint]?: T; };

/**
 * Converte propriedades Responsivas { base, md, lg } em classes do Tailwind.
 * Ex: { base: 'column', md: 'row' } -> "flex-col md:flex-row"
 */
export function parseResponsive<T extends string | number | boolean>(
  prop: Responsive<T> | undefined,
  classMap: Record<string, string>,
): string {
  if (prop === undefined || prop === null) {
    return '';
  }

  // Se for um valor simples (ex: columns={4})
  if (typeof prop !== 'object') {
    return classMap[String(prop)] || '';
  }

  // Se for um objeto responsivo (ex: columns={{ base: 1, md: 4 }})
  const classes: string[] = [];

  if (prop.base !== undefined) {
    classes.push(classMap[String(prop.base)]);
  }
  if (prop.sm !== undefined) {
    classes.push(`sm:${classMap[String(prop.sm)]}`);
  }
  if (prop.md !== undefined) {
    classes.push(`md:${classMap[String(prop.md)]}`);
  }
  if (prop.lg !== undefined) {
    classes.push(`lg:${classMap[String(prop.lg)]}`);
  }
  if (prop.xl !== undefined) {
    classes.push(`xl:${classMap[String(prop.xl)]}`);
  }
  if (prop['2xl'] !== undefined) {
    classes.push(`2xl:${classMap[String(prop['2xl'])]}`);
  }

  return classes.filter(Boolean).join(' ');
}
