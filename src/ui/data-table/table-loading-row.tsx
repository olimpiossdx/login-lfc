import React from 'react';

import { TableCell, TableRow } from '../table';

export const TableLoadingRow: React.FC = () => {
  const [msg, setMsg] = React.useState('Buscando informações...');

  React.useEffect(() => {
    const t1 = setTimeout(() => setMsg('Sua conexão parece lenta. Já estamos processando...'), 8000);
    const t2 = setTimeout(() => setMsg('O servidor está demorando a responder. Por favor, aguarde...'), 20000);
    const t3 = setTimeout(() => setMsg('Ainda estamos aqui! Finalizando a organização dos dados...'), 45000);
    const t4 = setTimeout(() => setMsg('Quase pronto! Agradecemos a sua paciência...'), 70000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <TableRow className="border-none">
      <TableCell colSpan={100} className="h-64 text-center transition-colors duration-200 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-cyan-600 dark:border-t-cyan-400"></div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold text-gray-700 dark:text-gray-200 animate-pulse">{msg}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              Aguarde enquanto estabilizamos a conexão com o servidor.
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
