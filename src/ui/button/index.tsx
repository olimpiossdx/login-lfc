import React from 'react';

import type { IButtonElement, IButtonProps } from './propTypes';
import { cn } from '../../utils/cn';
import { Spinner } from '../spinner';

// 👇 O Tipo Literal que garante a Máquina de Estados
type ButtonState = 'ocioso' | 'loading' | 'disabled';

const Button = React.forwardRef<IButtonElement, IButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading: propLoading,
      disabled: propDisabled,
      leftIcon,
      rightIcon,
      fullWidth = false,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);

    // 👇 1. Estado Único Interno
    const [internalState, setInternalState] = React.useState<ButtonState>('ocioso');

    // 👇 2. Motor de Precedência (Props declarativas > Estado imperativo)
    const effectiveState = React.useMemo<ButtonState>(() => {
      // Prioridade Absoluta: Block/Disabled
      if (propDisabled || internalState === 'disabled') {
        return 'disabled';
      }
      // Prioridade Secundária: Loading
      if (propLoading || internalState === 'loading') {
        return 'loading';
      }
      // Fallback: Livre
      return 'ocioso';
    }, [propDisabled, propLoading, internalState]);

    // 👇 3. Tradução para a UI nativa
    const showLoading = effectiveState === 'loading';
    const isActuallyDisabled = effectiveState === 'disabled' || effectiveState === 'loading';

    // 👇 4. Exposição Imperativa via Ref
    React.useImperativeHandle(ref, () => {
      const element = internalRef.current;
      if (!element) {
        return null as unknown as IButtonElement;
      }

      const augmentedElement = element as IButtonElement;

      // As funções de set agora fazem transição de estado da FSM
      augmentedElement.setLoading = (val: boolean) => setInternalState(val ? 'loading' : 'ocioso');
      augmentedElement.setDisabled = (val: boolean) => setInternalState(val ? 'disabled' : 'ocioso');

      // Getters refletem a realidade processada da interface
      Object.defineProperty(augmentedElement, 'loading', {
        get: () => showLoading,
        configurable: true,
      });

      Object.defineProperty(augmentedElement, 'disabled', {
        get: () => isActuallyDisabled,
        configurable: true,
      });

      return augmentedElement;
    }, [showLoading, isActuallyDisabled]);

    // 👇 Ajuste Visual: Transparência dinâmica baseada no estado real
    const baseStyles = cn(
      'inline-flex items-center justify-center rounded-lg font-medium gap-2',
      'transition-all duration-300 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-cyan-500/50 dark:ring-offset-gray-900',
      'disabled:pointer-events-none select-none',
      effectiveState === 'disabled' ? 'disabled:opacity-50' : 'disabled:opacity-80',
    );

    const variants = {
      primary: 'bg-blue-600 !text-white hover:bg-blue-700 shadow-sm border border-transparent dark:bg-blue-600 dark:hover:bg-blue-700',
      'primary-soft':
        'bg-blue-50 !text-blue-700 hover:bg-blue-100 hover:!text-blue-800 shadow-sm border border-blue-100 dark:bg-blue-500/15 dark:!text-blue-300 dark:border-blue-500/20 dark:hover:bg-blue-500/25 dark:hover:!text-blue-200',
      secondary:
        'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 border border-transparent dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
      outline:
        'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
      ghost: 'hover:bg-gray-100 hover:text-gray-800 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-100',
      destructive: 'bg-red-600 !text-white hover:bg-red-700 shadow-sm border border-transparent dark:bg-red-600 dark:hover:bg-red-700',
      link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    const finalClassName = cn(baseStyles, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className);

    return (
      <button ref={internalRef} type={type} className={finalClassName} disabled={isActuallyDisabled} {...props}>
        {showLoading ? (
          <>
            <Spinner size={size === 'sm' ? 'sm' : 'md'} className="animate-spin shrink-0" />
            {leftIcon ? children : children && <span>{children}</span>}
            {!leftIcon && !children && rightIcon && null}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex items-center shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
