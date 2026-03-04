import React from 'react';
import Flex from '../../../../../ui/flex';
import Input from '../../../../../ui/input';
import Button from '../../../../../ui/button';
import FormModal from './form.modal';
import { Plus } from 'lucide-react';
import Form from '../../../../../ui/form';
import Heading from '../../../../../ui/typography/heading';
import Alert from '../../../../../ui/alert';
import { TableListagem, type TableListagemHookFormProps } from '../../../../../ui/data-table/table-listagem';
import { TableCell, TableHead, TableRow } from '../../../../../ui/table';
import Grid from '../../../../../ui/grid';
import { Select } from '../../../../../ui/select';
import type { IApiResponse } from '../../../../../service/types';
import type { IButtonElement } from '../../../../../ui/button/propTypes';

interface UserModel {
  id: number | string;
  nome: string;
  sobrenome: string;
  telefone: string;
  logradouro: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  password: string;
  cpfCnpj: string;
  urlImage: string | null;
  tipoCpfCnpj: any;
  imoveis: any[];
}

interface IFilterUser {
  title_like: string;
  userId: string;
}

const Row = (item: UserModel) => {
  return (<TableRow key={item.id}>
      <TableCell>#{item.nome} - {item.sobrenome}</TableCell>
      <TableCell>
        <Flex flexDirection="column" gap={1}>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight capitalize">{item.cpfCnpj}</span>
        </Flex>
      </TableCell>
      <TableCell>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 pr-4">{item.telefone}</p>
      </TableCell>
    </TableRow>);
};

const Header = () => {
  return (<TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Título do Post</TableHead>
      <TableHead>Resumo do Conteúdo</TableHead>
    </TableRow>);
};

const Filter: React.FC<{ formProps: TableListagemHookFormProps<IFilterUser>; estaCarregando: boolean }> = ({
  formProps,
  estaCarregando,
}) => {
  const btnBuscarRef = React.useRef<IButtonElement>(null);
  const btnLimparRef = React.useRef<IButtonElement>(null);

  // A máquina de estados imperativa funciona perfeitamente aqui!
  React.useEffect(() => {
    if (estaCarregando) {
      btnBuscarRef.current?.setDisabled(true);
      btnLimparRef.current?.setDisabled(true);
    }
  }, []);

  React.useEffect(() => {
    if (!estaCarregando) {
      btnBuscarRef.current?.setLoading(false);
      btnBuscarRef.current?.setDisabled(false);
      btnLimparRef.current?.setLoading(false);
      btnLimparRef.current?.setDisabled(false);
    }
  }, [estaCarregando]);

  const handleSubmit = async ( valoresBrutos: IFilterUser, event: React.SubmitEvent<HTMLFormElement>): Promise<void | IApiResponse<any>> => {
    btnBuscarRef.current?.setLoading(true);
    btnLimparRef.current?.setDisabled(true);
    return await formProps.onSubmit(valoresBrutos, event);
  };

  const handleReset = (event: React.SubmitEvent<HTMLFormElement>): void => {
    btnLimparRef.current?.setLoading(true);
    btnBuscarRef.current?.setDisabled(true);
    //TODO: Veriicar necessidade de event.
    formProps.onReset(event);
  };

  return (<Form
      {...formProps}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      onReset={handleReset}
      onSubmit={handleSubmit}>
      <Grid columns={{ base: 1, md: 3, lg: 4 }} gap={4} alignItems="end">
        <Input label="Título do Post" id="title_like" name="title_like" disabled={estaCarregando} />
        <Select label="Autor" id="userId" name="userId" className="p-2 border rounded-md" disabled={estaCarregando}>
          <option value="">Todos</option>
          <option value="1">Utilizador 1</option>
          <option value="2">Utilizador 2</option>
        </Select>
        <Flex gap={2} className="md:col-span-1 lg:col-span-2" justifyContent="end">
          <Button ref={btnLimparRef} type="reset" variant="ghost" className="px-4 py-2">
            Limpar
          </Button>
          <Button ref={btnBuscarRef} type="submit" className="px-4 py-2">
            Buscar
          </Button>
        </Flex>
      </Grid>
    </Form>);
};

const CadastroCliente: React.FC = () => {
  return (
    <Flex flexDirection='column' gap={2}>
      <Flex>
       <Heading level={1} className="text-xl font-semibold">
        Cadastro cliente
       </Heading>
      </Flex>
     <Flex className="w-full" alignItems="center" justifyContent="end">
        <Button className="ml-2" variant="primary" onClick={FormModal} leftIcon={<Plus size={16} />}>
          Adicionar
        </Button>
      </Flex>
      <Flex>
      <TableListagem<UserModel, IFilterUser> responsiveMode="cards" Header={Header} Filter={Filter}Row={Row} endpoint="/user" 
        emptyState={
          <Alert variant="info" title="Nenhum resultado encontrado" className="w-full max-w-lg mx-auto my-4 text-left">
            Não encontrámos nenhum post correspondente ao filtro aplicado. Tente procurar por outros termos.
          </Alert>
        }
      />
      </Flex>
    </Flex>
  );
};
export default CadastroCliente;
