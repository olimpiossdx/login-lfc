import React from 'react';
import Flex from '../../../../../ui/flex';
import Input from '../../../../../ui/input';
import Button from '../../../../../ui/button';
import FormModal from './form.modal';
import { Plus } from 'lucide-react';

const CadastroEmpreendimento: React.FC = () => {
  return (
    <>
      <h1 className="text-xl font-semibold">Cadastro empreendimento</h1>
      <Flex className="w-full" alignItems="center" justifyContent="end">
        <Button className="ml-2" variant="primary" onClick={FormModal} leftIcon={<Plus size={16} />}>
          Adicionar
        </Button>
      </Flex>
      <form>
      <Flex alignItems="end">
        <Input label="Pesquise" name="pesquisar" placeholder="Pesquise por nome, cpf ou cpnj" />
        <Button type='submit' className="ml-2" variant="primary">
          Pesquise
        </Button>
      </Flex>
      </form>
    </>
  );
};
export default CadastroEmpreendimento;
