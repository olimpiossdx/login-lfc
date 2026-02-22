// utilities.ts

import type { FormField, IAnyObject } from './props';

/**
 * Helper para quebrar caminhos como "user.address" ou "users[0].name" em chaves
 */
const splitPath = (path: string) => path.replace(/\]/g, '').split(/[.\[]/);

/**
 * Define um valor em um objeto/array usando caminho (path)
 * Suporta: 'user.address.street' ou 'users[0].name'
 */
export const setNestedValue = (obj: IAnyObject, path: string, value: any): void => {
  if (value === undefined) {
    return;
  }

  const keys = splitPath(path);
  let current = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isLastKey = i === keys.length - 1;

    if (isLastKey) {
      current[key] = value;
      return;
    }

    const nextKey = keys[i + 1];
    const nextIsNumber = !isNaN(Number(nextKey));

    if (!current[key]) {
      current[key] = nextIsNumber ? [] : {};
    }

    current = current[key];
  }
};

/**
 * Obtém valor de objeto aninhado usando caminho
 */
export const getNestedValue = (obj: IAnyObject, path: string): any => {
  if (!path || !obj) {
    return undefined;
  }

  const keys = splitPath(path);

  return keys.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Seleciona campos do formulário baseado no prefixo
 */
export const getFormFields = (root: HTMLElement, namePrefix?: string): FormField[] => {
  const selector = namePrefix
    ? `input[name^="${namePrefix}"], select[name^="${namePrefix}"], textarea[name^="${namePrefix}"]`
    : 'input[name], select[name], textarea[name]';

  const nodeList = root.querySelectorAll(selector);

  return Array.from(nodeList).filter((el): el is FormField => {
    return (
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) &&
      el.type !== 'submit' &&
      el.type !== 'button' &&
      el.type !== 'reset' &&
      el.type !== 'image'
    );
  });
};

/**
 * Extrai caminho relativo do nome do campo baseado no prefixo
 */
export const getRelativePath = (fieldName: string, namePrefix?: string): string | null => {
  if (!namePrefix) {
    return fieldName;
  }
  if (fieldName === namePrefix) {
    return null;
  }

  if (fieldName.startsWith(namePrefix)) {
    let relative = fieldName.slice(namePrefix.length);
    if (relative.startsWith('.')) {
      relative = relative.slice(1);
    }
    return relative;
  }

  return null;
};

/**
 * Converte valor do campo DOM para tipo JavaScript apropriado
 */
export const parseFieldValue = (field: FormField): any => {
  if (field instanceof HTMLInputElement) {
    if (field.type === 'number') {
      return field.value === '' ? '' : parseFloat(field.value);
    }

    if (field.type === 'checkbox') {
      // AJUSTE: Verifica se o desenvolvedor atribuiu um valor explícito (diferente do 'on' padrão do HTML).
      // Se tiver valor explícito, retorna o valor se checado, senão undefined.
      // Se não tiver valor (ex: Aceito os termos), retorna booleano puro.
      const hasExplicitValue = field.hasAttribute('value') && field.value !== 'on';

      if (hasExplicitValue) {
        return field.checked ? field.value : undefined;
      }

      return field.checked;
    }

    if (field.type === 'radio') {
      return field.checked ? field.value : undefined;
    }
  }

  return field.value;
};
