import { User, Mail } from 'lucide-react';
import { showModal } from '../../../../../ui/modal';
import { ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../../../../../ui/modal/modal';
import { Select } from '../../../../../ui/select';
import Button from '../../../../../ui/button';
import Input from '../../../../../ui/input';
import Form from '../../../../../ui/form';

const FormModal = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  return showModal({
    size: 'lg',
    content: ({ onClose }) => {
      function handleSubmitAsync(body: Record<string, any>, event: React.SubmitEvent<HTMLFormElement>) {
        console.log('body,event', body, event);
        onClose();
      }
      return (
        <>
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <User className="text-blue-600" /> Novo cliente
            </ModalTitle>
            <ModalDescription>Preencha as informações abaixo para cadastrar.</ModalDescription>
          </ModalHeader>
          <Form className="w-full" onSubmit={handleSubmitAsync}>
            <ModalContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input name="nome" label="Nome" placeholder="João" variant="filled" />
                <Input name="sobreNome" label="Sobrenome" placeholder="Silva" variant="filled" />
              </div>

              <Input name="email" label="E-mail" type="email" leftIcon={<Mail size={18} />} placeholder="joao@empresa.com" />

              <div className="grid grid-cols-2 gap-4">
                <Select name="departamento" label="Departamento" variant="outlined">
                  <option>TI</option>
                  <option>RH</option>
                  <option>Vendas</option>
                </Select>
                <Select name='status' label="Status" variant="outlined">
                  <option>Ativo</option>
                  <option>Pendente</option>
                </Select>
              </div>
            </ModalContent>

            <ModalFooter className="bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white font-bold shadow-lg transition-transform active:scale-95  bg-red-600 hover:bg-red-700 hover:color-red-100">
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Salvar
              </Button>
            </ModalFooter>
          </Form>
        </>
      );
    },
  });
};

export default FormModal;
