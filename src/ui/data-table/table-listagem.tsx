import React from 'react';

import { TableLoadingRow } from './table-loading-row';
import { useListagem } from '../../hooks/use-listagem';
import type { IFormProps } from '../form';
import { Pagination } from '../pagination';
import { Table, TableBody, TableCell, TableContainer, TableHeader, type TableResponsiveMode, TableRow } from '../table';

// ============================================================================
// CONTRATOS E INTERFACES (Totalmente Tipados)
// ============================================================================

// AQUI ESTÁ O USO! Ele extrai exatamente as assinaturas do seu Form nativo.
// O Required garante que o Orquestrador SEMPRE entregue essas 3 props.
export type TableListagemHookFormProps<TFilters> = Required<Pick<IFormProps<TFilters>, 'initialValues' | 'onReset' | 'onSubmit'>>;
export interface TableListagemProps<TData, TFilters> {
  // 1. Comunicação com a API
  endpoint: string;
  initialFilters?: TFilters;
  initialSize?: number;
  request?: (params: any) => any;
  response?: (data: any, headers: Headers) => { items: TData[]; total: number };

  // 2. Configurações Visuais Herdadadas (Sem o ruído do DataTable base)
  responsiveMode?: TableResponsiveMode;
  density?: 'sm' | 'md' | 'lg';
  emptyState?: React.ReactNode;
  className?: string;

  // 3. O Filtro Injetado
  Filter?: React.FC<{
    formProps: TableListagemHookFormProps<TFilters>;
    estaCarregando: boolean;
  }>;

  // 4. A Liberdade Visual (Substitutos de "columns")
  Header: () => React.ReactNode;
  Row: (item: TData, index: number) => React.ReactNode;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function TableListagem<TData extends { id: string | number }, TFilters extends Record<string, any> = Record<string, any>>({
  endpoint,
  initialFilters = {} as TFilters,
  initialSize = 10,
  request,
  response,
  responsiveMode = 'none',
  density = 'md',
  emptyState,
  className,
  Filter,
  Header,
  Row,
}: TableListagemProps<TData, TFilters>) {
  // Instancia o motor de dados internamente
  const listagem = useListagem<TData, TFilters>({ endpoint, initialFilters, initialSize, mapRequest: request, mapResponse: response });

  // Prepara as propriedades nativas para o formulário do desenvolvedor
  const formProps: TableListagemHookFormProps<TFilters> = {
    initialValues: listagem.filtros,
    onReset: () => listagem.limparFiltros(),
    onSubmit: async (valores, event) => {
      // Retorna a Promise para alimentar o IApiResponse do FormAlert
      return await listagem.filtrar(valores);
    },
  };

  return (
    <div className={`flex flex-col gap-4 w-full ${className || ''}`}>
      {/* RENDERIZAÇÃO DO FILTRO (Se fornecido) */}
      {Filter && <Filter formProps={formProps} estaCarregando={listagem.estaCarregando} />}

      {/* RENDERIZAÇÃO DA TABELA (Usando Primitivos Livres) */}
      <TableContainer>
        <Table density={density} responsiveMode={responsiveMode}>
          <TableHeader>{Header && Header()}</TableHeader>

          <TableBody>
            {/* ESTADO 1: LOADING (Prioridade absoluta) */}
            {listagem.status === 'carregando' && <TableLoadingRow />}

            {/* 2. ESTADO VAZIO: Só aparece se terminou de carregar com sucesso e não há dados */}
            {!listagem.estaCarregando && listagem.status === 'sucesso' && listagem.dados.length === 0 && (
              <TableRow>
                <TableCell colSpan={100} className="p-4 text-center">
                  {emptyState || <div className="text-gray-500 py-8 italic">Nenhum registo encontrado.</div>}
                </TableCell>
              </TableRow>
            )}

            {/* ESTADO 3: DADOS (Só após carregar) */}
            {listagem.status === 'sucesso' &&
              listagem.dados.length > 0 &&
              listagem.dados.map((item, index) => {
                return Row(item, index);
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* RENDERIZAÇÃO DA PAGINAÇÃO (Automática) */}
      {listagem.dados.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-gray-500">
            <span>Total: {listagem.paginacao.totalCount} registos</span>
          </div>

          <Pagination
            currentPage={listagem.paginacao.currentPage}
            totalCount={listagem.paginacao.totalCount}
            pageSize={listagem.paginacao.pageSize}
            onPageChange={listagem.paginacao.onPageChange}
            onPageSizeChange={listagem.paginacao.onPageSizeChange}
            pageSizeOptions={[5, 10, 20, 50]}
            size="sm"
            variant="ghost"
            className="w-full sm:w-auto justify-center sm:justify-end"
          />
        </div>
      )}
    </div>
  );
}
