import React from 'react';

import { api } from '../../service/api';
import type { IApiResponse } from '../../service/http/types';
import { getParamsFromUrl, serializeParams } from '../../utils/params';
import { useAbortController } from '../abort-controller';

export type Status = 'ocioso' | 'carregando' | 'sucesso' | 'erro';

interface UseListagemOptions<F> {
  endpoint: string;
  initialFilters?: F;
  initialPage?: number;
  initialSize?: number;
  manual?: boolean;
  syncWithUrl?: boolean;
  debounceTime?: number;
  mapRequest?: (params: { page: number; size: number } & F) => Record<string, any>;
  mapResponse?: (res: any, headers: Headers) => { items: any[]; total: number };
}

export const useListagem = <T, F extends Record<string, any>>({
  endpoint,
  initialFilters = {} as F,
  initialPage = 1,
  initialSize = 10,
  manual = false,
  syncWithUrl = false,
  debounceTime = 500,
  mapRequest,
  mapResponse,
}: UseListagemOptions<F>) => {
  const { getSignal, abortManual } = useAbortController();
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initialState] = React.useState(() => {
    if (!syncWithUrl || typeof window === 'undefined') {
      return { page: initialPage, filters: initialFilters };
    }
    const urlParams = getParamsFromUrl(window.location.search);
    const { page, ...rest } = urlParams;
    return { page: Number(page) || initialPage, filters: { ...initialFilters, ...rest } as F };
  });

  const [dados, setDados] = React.useState<T[]>([]);
  const [status, setStatus] = React.useState<Status>(manual ? 'ocioso' : 'carregando');
  const [total, setTotal] = React.useState(0);
  const [pagina, setPagina] = React.useState(initialState.page);
  const [tamanho, setTamanho] = React.useState(initialSize);
  const [filtros, setFiltros] = React.useState<F>(initialState.filters);
  const isInterrupcao = React.useRef(false);

  // Sincronização inteligente com a URL
  React.useEffect(() => {
    if (syncWithUrl && typeof window !== 'undefined') {
      const flatParams = serializeParams({ page: pagina, ...filtros });
      const searchParams = new URLSearchParams(flatParams);
      const queryString = searchParams.toString();
      const novaUrl = queryString ? `?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', novaUrl);
    }
  }, [pagina, filtros, syncWithUrl]);

  const cancelar = React.useCallback(() => {
    isInterrupcao.current = true;
    abortManual();
    setStatus('ocioso');
  }, [abortManual]);

  const executar = React.useCallback(
    async (overrides?: { page?: number; filters?: F }) => {
      isInterrupcao.current = false;
      setStatus('carregando');
      const p = overrides?.page ?? pagina;
      const f = overrides?.filters ?? filtros;

      const paramsBase = { page: p, size: tamanho, ...f };
      const finalParams = mapRequest ? mapRequest(paramsBase) : paramsBase;

      const res: IApiResponse<any> = await api.get(endpoint, {
        params: finalParams,
        signal: getSignal(),
        notifyOnError: true,
      });

      if (res.isSuccess && res.data) {
        let listaFinal: T[] = [];
        let totalFinal = 0;

        if (mapResponse) {
          const mapped = mapResponse(res.data, res.headers);
          listaFinal = mapped.items;
          totalFinal = mapped.total;
        } else if (Array.isArray(res.data)) {
          listaFinal = res.data;
          const headerTotal = res.headers.get('x-total-count');
          totalFinal = headerTotal ? Number(headerTotal) : res.data.length;
        } else {
          listaFinal = res.data.items || [];
          totalFinal = res.data.total || 0;
        }

        const maxPages = Math.ceil(totalFinal / tamanho) || 1;

        if (p > maxPages && totalFinal > 0) {
          if (pagina !== maxPages) {
            setPagina(maxPages);
          }
          return;
        }

        setDados(listaFinal);
        setTotal(totalFinal);
        setStatus('sucesso');
      } else {
        console.log('res', res);
        const isAbort = res.error?.code === 'REQUEST_ABORTED';

        // Se foi um aborto automático (limpar filtros, trocar página, Strict Mode):
        // Retornamos sem mudar o status para manter o loading vivo para a próxima request.
        if (isAbort && !isInterrupcao.current) {
          return;
        }

        // Se foi erro real ou interrupção manual do usuário:
        setStatus(isAbort ? 'ocioso' : 'erro');
      }
    },
    [endpoint, pagina, tamanho, filtros, getSignal, mapRequest, mapResponse],
  );

  React.useEffect(() => {
    if (!manual) {
      executar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, tamanho, filtros, manual]);

  const filtrar = React.useCallback(
    (novos: Partial<F>, customDebounce?: number) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      const delay = customDebounce !== undefined ? customDebounce : debounceTime;

      debounceTimer.current = setTimeout(() => {
        setFiltros((prev) => {
          const merged = { ...prev, ...novos };
          return Object.fromEntries(Object.entries(merged).filter(([_, v]) => v !== undefined && v !== '' && v !== null)) as F;
        });
        setPagina(1);
      }, delay);
    },
    [debounceTime],
  );

  // Nova função de reset
  const limparFiltros = React.useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    isInterrupcao.current = false;
    setFiltros(() => ({ ...initialFilters }));
    setPagina(() => initialPage);
  }, [initialFilters, initialPage]);

  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    dados,
    status,
    filtros,
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
    limparFiltros,
    recarregar: React.useCallback(() => executar(), [executar]),
    cancelar,
    estaCarregando: status === 'carregando',
  };
};
