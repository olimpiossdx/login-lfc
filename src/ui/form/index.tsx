import React from 'react';

import FormAlert from './alert';
import { FormRegistryContext } from './context';
import type { FormServices, IAlertService } from './services';
import useForm from '../../hooks/use-form';
import type { ValidationMode, ValidatorMap } from '../../hooks/use-form/props';
import type { IApiResponse, INotification } from '../../service/types';
import type { IInputProps } from '../input';

export interface IFormProps<TValues> {
  id?: string;
  initialValues?: TValues;
  validationRules?: ValidatorMap<TValues>;
  validationMode?: ValidationMode;
  // O onSubmit agora pode retornar a IApiResponse para o Form tratar os alertas internos
  onSubmit?: (values: TValues, event: React.FormEvent<HTMLFormElement>) => void | Promise<void | IApiResponse<any>>;
  children: React.ReactNode;
}

// 1. TIPAGEM UNIVERSAL: Aceita Record<string, any> para suportar booleanos e arrays do useForm
function Form<TValues extends Record<string, any> = Record<string, any>>(props: IFormProps<TValues>) {
  const { id, initialValues, validationRules, validationMode, onSubmit, children } = props;

  const { formProps, resetSection, setValidators, handleSubmit } = useForm<TValues>({ id, onSubmit, validationMode });

  // Registry name -> ref
  const fieldRefs = React.useRef<Map<string, IInputProps>>(new Map());

  const registerFieldRef = React.useCallback((name: string, ref: IInputProps | null) => {
    if (!ref) {
      fieldRefs.current.delete(name);
    } else {
      fieldRefs.current.set(name, ref);
    }
  }, []);

  const servicesRef = React.useRef<FormServices>({});

  // Aplicar mapa de validação
  React.useEffect(() => {
    if (validationRules) {
      setValidators(validationRules as ValidatorMap<TValues>);
    }
  }, [validationRules, setValidators]);

  // 2. BLINDAGEM DE RENDERIZAÇÃO: Previne loops e perda de dados do usuário
  const prevInitialValues = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (!initialValues) {
      return;
    }

    const currentStringified = JSON.stringify(initialValues);
    if (prevInitialValues.current !== currentStringified) {
      resetSection('', initialValues);
      prevInitialValues.current = currentStringified;
    }
  }, [initialValues, resetSection]);

  // 3. INTEGRAÇÃO INTELIGENTE DE FEEDBACK (Sem Toasts Hardcoded)
  let submitHandler: React.FormEventHandler<HTMLFormElement> | undefined = formProps.onSubmit;

  if (onSubmit) {
    submitHandler = handleSubmit(async (values: TValues, event: React.FormEvent<HTMLFormElement>) => {
      // Limpa qualquer alerta anterior antes de uma nova submissão
      servicesRef.current.alert?.hide();

      try {
        const response = await onSubmit(values, event);

        // Se o onSubmit do Pai retornar o IApiResponse do HttpClient, o Form reage visualmente a ele
        if (response && typeof response === 'object' && 'isSuccess' in response) {
          if (!response.isSuccess) {
            // Busca a primeira notificação de erro ou usa a mensagem geral
            const errorNotif = response.notificacoes?.find((n: INotification) => n.status === 'error');
            const errorMsg = errorNotif?.mensagem || response.error?.message || 'Ocorreu um erro ao processar sua requisição.';

            // Exibe a mensagem no balão <FormAlert> interno para retenção visual local
            servicesRef.current.alert?.show(errorMsg, 'error');

            // (Bônus) Feedback de Campo: Se a API indicou o campo com erro, focamos nele
            if (errorNotif && errorNotif.campo) {
              const fieldToFocus = event.currentTarget.querySelector(`[name="${errorNotif.campo}"]`) as HTMLElement;
              if (fieldToFocus) {
                fieldToFocus.focus();
              }
            }
          }
        }
      } catch (error) {
        // Fallback de segurança apenas para exceções graves não tratadas pela API (ex: erro de sintaxe)
        console.error('Erro de execução no submit do formulário:', error);
        servicesRef.current.alert?.show('Ocorreu um erro inesperado na aplicação.', 'error');
      }
    });
  }

  return (
    <FormRegistryContext.Provider value={{ registerFieldRef }}>
      <form {...formProps} onSubmit={submitHandler}>
        {/* Balão de Alerta gerenciado pelo FormServices */}
        <FormAlert
          register={(svc: IAlertService) => {
            servicesRef.current.alert = svc;
          }}
        />
        {children}
      </form>
    </FormRegistryContext.Provider>
  );
}

Form.displayName = 'Form';

export default Form;
