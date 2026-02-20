import { User, Mail } from 'lucide-react';
import { showModal } from '../../../../../ui/modal';
import { ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../../../../../ui/modal/modal';
import { Select } from '../../../../../ui/select';
import Button from '../../../../../ui/button';
import Input from '../../../../../ui/input';

const FormModal = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  return (showModal({
    size: 'lg',
    content: ({ onClose }) => (
      <>
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <User className="text-blue-600" /> Novo Usuário
          </ModalTitle>
          <ModalDescription>Preencha as informações abaixo para cadastrar um novo membro.</ModalDescription>
        </ModalHeader>

        <ModalContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome" placeholder="João" variant="filled" name={''} />
            <Input label="Sobrenome" placeholder="Silva" variant="filled" name={''} />
          </div>

          <Input label="E-mail" type="email" leftIcon={<Mail size={18} />} placeholder="joao@empresa.com" name={''} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Departamento" variant="outlined" name={''}>
              <option>TI</option>
              <option>RH</option>
              <option>Vendas</option>
            </Select>
            <Select label="Status" variant="outlined" name={''}>
              <option>Ativo</option>
              <option>Pendente</option>
            </Select>
          </div>
        </ModalContent>

        <ModalFooter className="bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <Button variant='ghost' onClick={onClose} className='bg-red-600 hover:bg-red-700 hover:color-red-100'>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              alert('Salvo!');
              onClose();
            }}>
            Salvar
          </Button>
        </ModalFooter>
      </>
    ),
  }));
};

export default FormModal;
