import React from 'react';
import { useAbortController } from '../abort-controller';
import { api } from '../../service/api';
import { getParamsFromUrl, serializeParams } from '../../utils/params';
import type { IApiResponse } from '../../service/http/types';

/**
 * Interface de Resposta Padrão da sua API para Listas
 */
export interface IPaginatedData<T> {
  items: T[];
  total: number;
}

/**
 * Status em Português conforme refinado
 */
export type Status = 'ocioso' | 'carregando' | 'sucesso' | 'erro';

interface UseListagemOptions<F> {
  endpoint: string;
  initialFilters?: F;
  initialPage?: number;
  initialSize?: number;
  manual?: boolean;
  syncWithUrl?: boolean;
}

export const useListagem = <T, F extends Record<string, any>>({
  endpoint,
  initialFilters = {} as F,
  initialPage = 1,
  initialSize = 10,
  manual = false,
  syncWithUrl = false,
}: UseListagemOptions<F>) => {
  const { getSignal } = useAbortController();

  // Estado inicial lendo da URL se habilitado
  const [initialState] = React.useState(() => {
    if (!syncWithUrl || typeof window === 'undefined') return { page: initialPage, filters: initialFilters };
    const urlParams = getParamsFromUrl(window.location.search);
    const { page, ...rest } = urlParams;
    return { page: Number(page) || initialPage, filters: { ...initialFilters, ...rest } as F };
  });

  const [dados, setDados] = React.useState<T[]>([]);
  const [status, setStatus] = React.useState<Status>('ocioso');
  const [total, setTotal] = React.useState(0);
  const [pagina, setPagina] = React.useState(initialState.page);
  const [tamanho, setTamanho] = React.useState(initialSize);
  const [filtros, setFiltros] = React.useState<F>(initialState.filters);

  // Sincronização State -> URL
  React.useEffect(() => {
    if (syncWithUrl && typeof window !== 'undefined') {
      const flatParams = serializeParams({ page: pagina, ...filtros });
      const searchParams = new URLSearchParams(flatParams);
      window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
    }
  }, [pagina, filtros, syncWithUrl]);

  const executarAsync = React.useCallback(
    async (overrides?: { page?: number; size?: number; filters?: F }) => {
      setStatus('carregando');
      const p = overrides?.page ?? pagina;
      const s = overrides?.size ?? tamanho;
      const f = overrides?.filters ?? filtros;

      const res: IApiResponse<IPaginatedData<T>> = await api.get(endpoint, {
        params: { page: p, size: s, ...f },
        signal: getSignal(),
        notifyOnError: true,
      });

      if (res.isSuccess && res.data) {
        const { items, total: t } = res.data;
        const max = Math.ceil(t / s) || 1;
        if (p > max && t > 0) {
          setPagina(max);
          return;
        }
        setDados(items);
        setTotal(t);
        setStatus('sucesso');
      } else if (res.error?.code !== 'REQUEST_ABORTED') {
        setStatus('erro');
      }
    },
    [endpoint, pagina, tamanho, filtros, getSignal],
  );

  React.useEffect(() => {
    if (!manual) executarAsync();
  }, [pagina, tamanho, filtros, manual, executarAsync]);

  const filtrar = React.useCallback((novos: Partial<F>) => {
    setFiltros((prev) => {
      const merged = { ...prev, ...novos };
      return Object.fromEntries(Object.entries(merged).filter(([_, v]) => v !== undefined && v !== '' && v !== null)) as F;
    });
    setPagina(1);
  }, []);

  return {
    dados,
    status,
    paginacao: {
      currentPage: pagina,
      totalCount: total,
      pageSize: tamanho,
      onPageChange: setPagina,
      onPageSizeChange: (s: number) => {
        setTamanho(s);
        setPagina(1);
      },
    },
    filtrar,
    recarregar: React.useCallback(() => executarAsync(), [executarAsync]),
    estaCarregando: status === 'carregando',
  };
};
