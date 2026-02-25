// Helper para transformar objeto (incluindo aninhados) em query string plana
export const serializeParams = (obj: any, prefix = ''): Record<string, string> => {
  let params: Record<string, string> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const propertyName = prefix ? `${prefix}[${key}]` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(params, serializeParams(value, propertyName));
      } else if (value !== undefined && value !== '') {
        params[propertyName] = String(value);
      }
    }
  }
  return params;
};

// Helper para ler a URL e reconstruir o estado inicial
export const getParamsFromUrl = (search: string): Record<string, any> => {
  const params = new URLSearchParams(search);
  const result: Record<string, any> = {};

  params.forEach((value, key) => {
    // Lógica simples para reconstruir chaves planas ou aninhadas básicas
    if (key.includes('[') && key.endsWith(']')) {
      const parts = key.split(/[\[\]]/).filter(Boolean);
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = current[parts[i]] || {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      result[key] = value;
    }
  });
  return result;
};