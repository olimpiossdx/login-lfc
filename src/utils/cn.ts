// ----------------------------------------------------------------------
// UTILITÁRIO CUSTOMIZADO: cn (ClassNames)
// ----------------------------------------------------------------------

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: any };

function toVal(mix: ClassValue): string {
  let k,
    y,
    str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (k = 0; k < mix.length; k++) {
        if (mix[k]) {
          if ((y = toVal(mix[k]))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            str && (str += ' ');
            str += y;
          }
        }
      }
    } else {
      for (k in mix) {
        if (mix && mix[k]) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          str && (str += ' ');
          str += k;
        }
      }
    }
  }

  return str;
}

function mergeTailwindClasses(className: string): string {
  if (!className) {
    return '';
  }

  const classes = className.split(' ').filter(Boolean);
  const classMap: Record<string, string> = {};
  const finalClasses: string[] = [];

  // CORREÇÃO CIRÚRGICA: Removido o 'flex-' genérico e adicionados os grupos reais de conflito do flexbox
  const conflictPrefixes = [
    'p-',
    'pt-',
    'pb-',
    'pl-',
    'pr-',
    'px-',
    'py-',
    'm-',
    'mt-',
    'mb-',
    'ml-',
    'mr-',
    'mx-',
    'my-',
    'text-',
    'bg-',
    'border-',
    'rounded-',
    'w-',
    'h-',
    'min-w-',
    'max-w-',
    'grid-',
    'justify-',
    'items-',
    'top-',
    'bottom-',
    'left-',
    'right-',
    'inset-',
    // Novos prefixos Flex isolados por categoria:
    'flex-row',
    'flex-col', // Direção conflita com direção
    'flex-wrap',
    'flex-nowrap', // Wrap conflita com wrap
  ];

  classes.forEach((cls) => {
    // Procura se a classe começa com um dos prefixos restritos
    const prefix = conflictPrefixes.find((p) => cls.startsWith(p));

    if (prefix) {
      classMap[prefix] = cls;
    } else {
      // Classes como 'flex-1', 'flex-auto', 'flex' (puro) passam direto sem se aniquilarem
      finalClasses.push(cls);
    }
  });

  return [...finalClasses, ...Object.values(classMap)].join(' ');
}

export function cn(...inputs: ClassValue[]) {
  let concatenated = '';
  for (let i = 0; i < inputs.length; i++) {
    const x = toVal(inputs[i]);
    if (x) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      concatenated && (concatenated += ' ');
      concatenated += x;
    }
  }

  return mergeTailwindClasses(concatenated);
}
