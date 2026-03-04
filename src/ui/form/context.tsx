import React from 'react';

import type { IInputProps } from '../input';

export interface IFormRegistryContextValue {
  registerFieldRef: (name: string, ref: IInputProps | null) => void;
}

export const FormRegistryContext = React.createContext<IFormRegistryContextValue | null>(null);

export const useFormRegistry = () => {
  const ctx = React.useContext(FormRegistryContext);
  if (!ctx) {
    throw new Error('useFormRegistry precisa ser usado dentro do <Form>');
  }
  return ctx;
};
