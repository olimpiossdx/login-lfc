import React from 'react';
import Flex from '../../../../../ui/flex';
import Input from '../../../../../ui/input';
import Button from '../../../../../ui/button';
import FormModal from './form.modal';
import { Plus } from 'lucide-react';
import Form from '../../../../../ui/form';
import Heading from '../../../../../ui/typography/heading';

const CadastroCliente: React.FC = () => {
  const [loading, setLoading] = React.useTransition();

  const handleSubmitSearchAsync = async (data: { pesquisar: string }) => {
    setLoading(() => {
      console.log(data);
    });
  };

  return (
    <>
      <Heading level={1} className="text-xl font-semibold">
        Cadastro cliente
      </Heading>
      <Flex className="w-full" alignItems="center" justifyContent="end">
        <Button className="ml-2" variant="primary" onClick={FormModal} leftIcon={<Plus size={16} />}>
          Adicionar
        </Button>
      </Flex>
      <Form onSubmit={handleSubmitSearchAsync} className="w-full gap-1">
        <Flex alignItems="end">
          <Input label="Pesquise" name="pesquisar" placeholder="Pesquise por nome, cpf ou cpnj" />
          <Button type="submit" className="ml-2" variant="primary">
            Pesquise
          </Button>
        </Flex>
      </Form>
    </>
  );
};
export default CadastroCliente;
