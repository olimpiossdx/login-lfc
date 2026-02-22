import React from 'react';

import type { FieldListenerMap, FormField, Path, PathValue, UseFormConfig, ValidationMode, ValidatorMap } from './props';
import { getFormFields, getNestedValue, getRelativePath, parseFieldValue, setNestedValue } from './utilities';
import { initializeCheckboxMasters, setNativeChecked, setNativeValue, syncCheckboxGroup } from '../../utils/utilities';
import type { ValidationResult, ValidationSeverity } from '../../utils/validate';

/**
 * Hook principal para gerenciamento de formulários com arquitetura Híbrida.
 * * Funcionalidades:
 * - **Uncontrolled:** O DOM é a fonte da verdade.
 * - **Native Bypass:** Sincronia de edição programática.
 * - **Scoped Validation:** Validação parcial para Wizards/Tabs.
 * - **Callback Ref:** Gerenciamento robusto de ciclo de vida do DOM.
 * * @param configOrId - Configuração do formulário ou apenas o ID em formato de string.
 */
const useForm = <FV extends Record<string, any>>(configOrId?: string | UseFormConfig<FV>) => {
  // Normalização da Configuração
  const config = typeof configOrId === 'string' ? ({ id: configOrId } as UseFormConfig<FV>) : configOrId || {};
  const formId = config.id || crypto.randomUUID();
  const onSubmitCallback = config.onSubmit;

  // --- REFS DE ESTADO (Persistem entre renders) ---

  /**
   * Ref para blindagem contra Stale Closures (Fechamentos Velhos).
   * Guarda o modo de validação atualizado para que funções pesadas (envolvidas em useCallback)
   * não precisem ser recriadas a cada render, mas sempre leiam a configuração mais recente.
   */
  const validationModeRef = React.useRef<ValidationMode>(config.validationMode ?? 'native');

  // Sincroniza a Ref caso o componente pai mude a prop durante o ciclo de vida
  React.useEffect(() => {
    validationModeRef.current = config.validationMode ?? 'native';
  }, [config.validationMode]);

  const fieldListeners = React.useRef<FieldListenerMap>(new Map());
  const validators = React.useRef<ValidatorMap<FV>>({});
  const debounceMap = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const isResetting = React.useRef(false);
  const observerRef = React.useRef<MutationObserver | null>(null);

  // Referência ativa do elemento <form> no DOM
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // --- GERENCIAMENTO DE LISTENERS ---

  /**
   * Limpa todos os event listeners, observers e timers pendentes.
   * Previne memory leaks quando o formulário é desmontado ou recriado.
   */
  const cleanupLogic = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Prevenção de Memory Leak: Limpa timers de debounce rodando em background
    debounceMap.current.forEach((timer) => clearTimeout(timer));
    debounceMap.current.clear();

    fieldListeners.current.forEach((listeners, field) => {
      field.removeEventListener('blur', listeners.blur);
      field.removeEventListener('input', listeners.change);
      field.removeEventListener('change', listeners.change);
    });
    fieldListeners.current.clear();
  };

  /**
   * **Callback Ref**: A chave da arquitetura.
   * O React chama esta função sempre que o nó DOM do form é montado ou desmontado.
   * Garante que os listeners sejam reconectados caso o form sofra um re-render destrutivo.
   * * @param node - O elemento HTMLFormElement nativo.
   */
  const registerForm = React.useCallback((node: HTMLFormElement | null) => {
    if (formRef.current) {
      cleanupLogic(); // Limpa o anterior
    }

    formRef.current = node;

    if (node) {
      setupDOMMutationObserver(node); // Inicia no novo
    }
  }, []);

  const countFieldsByName = (form: HTMLElement, name: string): number => {
    return form.querySelectorAll(`[name="${name}"]`).length;
  };

  const setValidators = React.useCallback((newValidators: ValidatorMap<FV>) => {
    validators.current = newValidators;
  }, []);

  // ============ LEITURA DE DADOS (DOM -> JSON) ============

  /**
   * Extrai os valores do formulário lendo diretamente do DOM.
   * Suporta extração parcial baseada em prefixo de nome (ex: "address").
   * Lida com checkboxes agrupados e isolados.
   */
  const getValueImpl = React.useCallback((namePrefix?: string): any => {
    const form = formRef.current;
    if (!form) {
      return namePrefix ? undefined : ({} as FV);
    }

    const fields = getFormFields(form, namePrefix);

    // Busca exata (campo único)
    if (namePrefix) {
      const exactMatch = fields.find((f) => f.name === namePrefix);
      if (exactMatch) {
        if (exactMatch instanceof HTMLInputElement && exactMatch.type === 'checkbox') {
          if (countFieldsByName(form, exactMatch.name) === 1) {
            const hasValue = exactMatch.hasAttribute('value') && exactMatch.value !== 'on';
            return exactMatch.checked ? (hasValue ? exactMatch.value : true) : false;
          }
        }
        return parseFieldValue(exactMatch);
      }
    }

    // Busca coletiva (Objeto completo)
    const formData: Record<string, any> = {};
    const processedNames = new Set<string>();

    fields.forEach((field) => {
      const relativePath = getRelativePath(field.name, namePrefix);
      if (!relativePath || processedNames.has(field.name)) {
        return;
      }

      if (field instanceof HTMLInputElement && field.type === 'checkbox') {
        const count = countFieldsByName(form, field.name);
        if (count > 1) {
          const allChecked = form.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${field.name}"]:checked`);
          const values = Array.from(allChecked).map((cb) => cb.value);
          setNestedValue(formData, relativePath, values);
          processedNames.add(field.name);
        } else {
          if (field.checked) {
            const hasExplicitValue = field.hasAttribute('value') && field.value !== 'on';
            setNestedValue(formData, relativePath, hasExplicitValue ? field.value : true);
          } else {
            setNestedValue(formData, relativePath, false);
          }
        }
        return;
      }
      setNestedValue(formData, relativePath, parseFieldValue(field));
    });

    return formData;
  }, []);

  const getValue = getValueImpl as { (): FV; <P extends Path<FV>>(namePrefix: P): PathValue<FV, P>; (namePrefix: string): any };

  // ============ VALIDAÇÃO ============

  type InternalValidationType = ValidationSeverity | '__none__';

  interface InternalValidationResult {
    message: string;
    type: InternalValidationType;
  }

  /**
   * Normaliza o resultado da validação customizada para um formato interno padrão.
   */
  const normalizeValidationResult = (result: ValidationResult): InternalValidationResult => {
    if (!result) {
      return { message: '', type: '__none__' };
    }
    if (typeof result === 'string') {
      return { message: result, type: 'error' };
    }
    return { message: result.message, type: result.type! };
  };

  /**
   * Executa a validação de um campo em duas etapas:
   * 1. Validação Nativa (HTML5) via checkValidity()
   * 2. Validação Customizada via JS (se definida nos validators)
   * * @param field - Campo DOM a ser validado.
   * @param formValues - Valores atuais do formulário para validação cruzada.
   * @returns O resultado interno contendo a mensagem e o tipo de erro.
   */
  const validateFieldInternal = (field: FormField, formValues: FV): InternalValidationResult => {
    const validateFn = validators.current[field.dataset.validation || ''];
    field.setCustomValidity('');

    if (!field.checkValidity()) {
      return { message: field.validationMessage || '', type: 'error' };
    }

    if (validateFn) {
      const fieldValue = getNestedValue(formValues, field.name);
      const rawResult = validateFn(fieldValue, field, formValues);
      const normalized = normalizeValidationResult(rawResult);

      if (normalized.message) {
        field.setCustomValidity(normalized.message);
        return normalized;
      }
    }
    return { message: '', type: '__none__' };
  };

  /**
   * Sincroniza o helper-text via ponteiro na ref do campo (se existir no componente React).
   * Executado independentemente da existência de errorSlot no DOM.
   */
  const syncHelperForField = (field: FormField, result: InternalValidationResult, mode: ValidationMode) => {
    const inputElement = field as any;
    if (!inputElement.helperText) {
      return;
    }

    if (mode === 'native') {
      return;
    }

    if (mode === 'helper' || mode === 'both') {
      const message = result.message;
      if (message) {
        const helperType = result.type === '__none__' ? undefined : result.type;
        inputElement.helperText.set(message, helperType);
      } else {
        inputElement.helperText.set(null);
      }
    }
  };

  /**
   * Atualiza a UI de erro nativa (slot/balão etc.) respeitando o validationMode.
   * Adiciona também os atributos ARIA para acessibilidade.
   */
  const updateErrorUI = (field: FormField, result: InternalValidationResult, mode: ValidationMode) => {
    const message = result.message;
    const hasError = !!message;
    const errorId = `error-${field.name}`;
    const errorSlot = document.getElementById(errorId);

    // PARTE 1: ARIA
    if (hasError) {
      field.setAttribute('aria-invalid', 'true');
      if (errorSlot) {
        field.setAttribute('aria-describedby', errorId);
      }
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }

    // PARTE 2: SLOT NATIVO
    if (errorSlot) {
      if (mode === 'helper') {
        errorSlot.textContent = '';
        errorSlot.setAttribute('data-visible', 'false');
        errorSlot.style.display = 'none';
      } else {
        errorSlot.textContent = message;
        errorSlot.setAttribute('data-visible', hasError ? 'true' : 'false');
        errorSlot.style.display = hasError ? 'block' : 'none';
      }
    }

    // PARTE 3: HELPER
    syncHelperForField(field, result, mode);
  };

  // ============ VALIDAÇÃO GLOBAL ============

  /**
   * Revalida todos os campos do formulário ignorando os desabilitados.
   * Utiliza a Ref de ValidationMode para estar sempre sincronizado.
   */
  const revalidateAllCustomRules = React.useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const formValues = getValue() as FV;
    const allFields = getFormFields(form);
    const mode = validationModeRef.current;

    allFields.forEach((field) => {
      if (field.disabled) {
        return;
      }
      const result = validateFieldInternal(field, formValues);
      updateErrorUI(field, result, mode);
    });
  }, [getValue]);

  /**
   * Valida apenas um subconjunto de campos dentro de um container específico.
   * Essencial para Wizards e Abas onde apenas o passo atual deve ser validado.
   * * @param container - Elemento HTML que envolve os campos a serem validados.
   * @returns boolean indicando se o escopo inteiro é válido.
   */
  const validateScope = React.useCallback(
    (container: HTMLElement) => {
      const form = formRef.current;
      if (!form || !container) {
        return true;
      }

      const formValues = getValue() as FV;
      const fieldsInScope = getFormFields(container);
      const mode = validationModeRef.current;

      let isValid = true;
      let firstInvalid: HTMLElement | null = null;

      fieldsInScope.forEach((field) => {
        field.classList.add('is-touched');
        if (field.disabled) {
          return;
        }

        const result = validateFieldInternal(field, formValues);
        updateErrorUI(field, result, mode);

        if (result.message || !field.checkValidity()) {
          isValid = false;
          if (!firstInvalid) {
            firstInvalid = field;
          }
        }
      });

      if (!isValid && firstInvalid) {
        // @ts-ignore
        if (firstInvalid.reportValidity && validationMode !== 'helper') {
          (firstInvalid as FormField).reportValidity();
        }
        // @ts-ignore
        firstInvalid.focus();
      }

      return isValid;
    },
    [getValue],
  );

  // ============ INTERAÇÃO (LISTENERS) ============

  /**
   * Trata os eventos de Input, Change e Blur dos campos.
   * Orquestra a sincronia do Debounce e a chamada de atualização da UI de validação.
   */
  const handleFieldInteraction = React.useCallback(
    (event: Event) => {
      if (isResetting.current) {
        return;
      }

      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (event.type === 'change' && target instanceof HTMLInputElement && target.type === 'checkbox') {
        if (formRef.current) {
          syncCheckboxGroup(target, formRef.current);
        }
      }

      const field = target as FormField;
      if (!field.name) {
        return;
      }

      field.classList.add('is-touched');
      const formValues = getValue() as FV;
      const mode = validationModeRef.current;

      if (debounceMap.current.has(field.name)) {
        clearTimeout(debounceMap.current.get(field.name));
        debounceMap.current.delete(field.name);
      }

      if (event.type === 'blur') {
        const result = validateFieldInternal(field, formValues);
        updateErrorUI(field, result, mode);
        return;
      }

      if (event.type === 'input' || event.type === 'change') {
        const wasInvalid = field.hasAttribute('aria-invalid') || !field.validity.valid;
        if (!wasInvalid) {
          return;
        }

        const result = validateFieldInternal(field, formValues);
        const msg = result.message;

        if (!msg) {
          updateErrorUI(field, { message: '', type: '__none__' }, mode);
        } else {
          const interval = mode !== 'helper' ? 600 : 0;
          const timer = setTimeout(() => {
            updateErrorUI(field, result, mode);

            if (document.activeElement === field) {
              // @ts-ignore
              if (field.reportValidity && mode !== 'helper') {
                // @ts-ignore
                field.reportValidity();
              }
            }
          }, interval);
          debounceMap.current.set(field.name, timer);
        }
      }
    },
    [getValue],
  );

  // ============ RESET / LOAD DATA ============

  /**
   * Reseta o formulário ou uma seção específica (útil para edição de dados existentes).
   * * @param namePrefix - Prefixo do caminho (path) para focar em dados específicos, ou vazio para tudo.
   * @param originalValues - Dados para preencher o formulário (ex: objeto do banco de dados).
   */
  const resetSection = React.useCallback((namePrefix: string, originalValues: any) => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    isResetting.current = true;
    try {
      const fields = getFormFields(form, namePrefix);
      const mode = validationModeRef.current;

      fields.forEach((field) => {
        if (debounceMap.current.has(field.name)) {
          clearTimeout(debounceMap.current.get(field.name));
          debounceMap.current.delete(field.name);
        }
        updateErrorUI(field, { message: '', type: '__none__' }, mode);

        const relativePath = getRelativePath(field.name, namePrefix);
        let valueToApply = undefined;
        if (originalValues) {
          valueToApply = relativePath ? getNestedValue(originalValues, relativePath) : undefined;
          if (valueToApply === undefined && !relativePath) {
            valueToApply = getNestedValue(originalValues, field.name);
          }
        }

        if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
          let shouldCheck = false;
          if (valueToApply !== undefined) {
            if (field.type === 'checkbox' && Array.isArray(valueToApply)) {
              shouldCheck = valueToApply.includes(field.value);
            } else if (field.type === 'checkbox' && typeof valueToApply === 'boolean') {
              shouldCheck = valueToApply;
            } else {
              shouldCheck = field.value === String(valueToApply);
            }
          } else {
            shouldCheck = field.defaultChecked;
          }
          setNativeChecked(field, shouldCheck);
        } else {
          const newVal = String(valueToApply ?? (field as any).defaultValue ?? '');
          setNativeValue(field, newVal);
        }

        field.classList.remove('is-touched');
        field.setCustomValidity('');
      });

      setTimeout(() => initializeCheckboxMasters(form), 0);
    } finally {
      setTimeout(() => {
        isResetting.current = false;
      }, 0);
    }
  }, []);

  // ============ OBSERVER & SETUP ============

  const addFieldInteractionListeners = (field: HTMLElement): void => {
    const isMaster = field.hasAttribute('data-checkbox-master');
    const allowedTypes = [HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement];
    if (!allowedTypes.some((type) => field instanceof type)) {
      return;
    }

    if (((field as any).name || isMaster) && !fieldListeners.current.has(field)) {
      const listeners = { blur: handleFieldInteraction, change: handleFieldInteraction };
      field.addEventListener('blur', listeners.blur);

      const types = ['text', 'email', 'password', 'search'];
      const inputEvent = field instanceof HTMLInputElement && types.includes(field.type) ? 'input' : 'change';

      if (inputEvent === 'input') {
        field.addEventListener('input', listeners.change);
      }
      field.addEventListener('change', listeners.change);

      fieldListeners.current.set(field, listeners);
    }
  };

  const removeFieldInteractionListeners = (field: HTMLElement): void => {
    const listeners = fieldListeners.current.get(field);
    if (listeners) {
      field.removeEventListener('blur', listeners.blur);
      field.removeEventListener('input', listeners.change);
      field.removeEventListener('change', listeners.change);
      fieldListeners.current.delete(field);
    }
  };

  /**
   * Configura o MutationObserver para vigiar nós DOM injetados ou removidos.
   * É o coração do 'Uncontrolled' acoplado à dinamicidade do React.
   */
  const setupDOMMutationObserver = (form: HTMLFormElement): void => {
    const initialFields = getFormFields(form);
    initialFields.forEach(addFieldInteractionListeners);

    form.querySelectorAll('input[type="checkbox"][data-checkbox-master]').forEach((cb) => {
      if (cb instanceof HTMLElement) {
        addFieldInteractionListeners(cb);
      }
    });
    initializeCheckboxMasters(form);

    observerRef.current = new MutationObserver((mutations) => {
      let needsReinitMasters = false;
      mutations.forEach((mutation) => {
        if (mutation.type !== 'childList') {
          return;
        }
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          addFieldInteractionListeners(node);
          getFormFields(node as any).forEach(addFieldInteractionListeners);
          if (node.querySelector('input[type="checkbox"]') || (node instanceof HTMLInputElement && node.type === 'checkbox')) {
            needsReinitMasters = true;
          }
        });
        mutation.removedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          removeFieldInteractionListeners(node);
          getFormFields(node as any).forEach(removeFieldInteractionListeners);
        });
      });
      if (needsReinitMasters) {
        initializeCheckboxMasters(form);
      }
    });

    observerRef.current.observe(form, { childList: true, subtree: true });
  };

  const focusFirstInvalidField = (form: HTMLFormElement): void => {
    const invalid = form.querySelector<HTMLElement>(':invalid');
    if (!invalid || invalid === null) {
      return;
    }

    const focusable = invalid.parentElement?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea, [tabindex="0"]');
    if (focusable && focusable instanceof HTMLElement) {
      focusable.focus();
    } else {
      invalid.focus();
    }
  };

  // ============ SUBMIT ============

  /**
   * Intercepta o Submit nativo, revalida tudo de forma imperativa
   * e, se estiver tudo certo, repassa os dados agrupados e o evento.
   */
  const handleSubmit = React.useCallback(
    (onValid: (data: FV, event: React.FormEvent<HTMLFormElement>) => void) => (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = formRef.current;
      if (!form) {
        return;
      }

      const allFields = getFormFields(form);
      allFields.forEach((field) => field.classList.add('is-touched'));

      revalidateAllCustomRules();

      setTimeout(() => {
        if (!formRef.current) {
          return;
        }
        const isValid = formRef.current.checkValidity();
        const mode = validationModeRef.current;

        if (!isValid) {
          focusFirstInvalidField(form);
          if (mode !== 'helper') {
            form.reportValidity();
          }
        } else {
          onValid(getValue() as FV, event);
        }
      }, 0);
    },
    [getValue, revalidateAllCustomRules],
  );

  const submitHandler = onSubmitCallback ? handleSubmit(onSubmitCallback) : undefined;

  const formProps = {
    id: formId,
    ref: registerForm,
    onSubmit: submitHandler,
    noValidate: true,
  };

  return {
    handleSubmit,
    setValidators,
    formId,
    resetSection,
    getValue,
    registerForm,
    formProps,
    validateScope,
  };
};

export default useForm;
