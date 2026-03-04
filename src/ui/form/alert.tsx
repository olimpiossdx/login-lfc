import React from 'react';

import type { alerVariant, IAlertService } from './services';
import Alert from '../alert';

interface IFormAlertProps {
  register: (svc: IAlertService) => void;
}

const FormAlert: React.FC<IFormAlertProps> = ({ register }) => {
  const [message, setMessage] = React.useState<string | null>(null);
  const [variant, setVariant] = React.useState<alerVariant>('error');

  React.useEffect(() => {
    const service: IAlertService = {
      show: (msg, v) => {
        setMessage(msg);
        setVariant(v ?? 'error');
      },
      hide: () => setMessage(null),
    };

    register(service);
  }, [register]);

  if (!message) {
    return null;
  }

  const handleClose = () => setMessage(null);
  //TODO: title precisa ser parametrizado ou ter um padrão diferente para 'error' e 'success'.
  return (
    <Alert className="w-full" variant={variant} title="Problemas encontrados" onClose={handleClose}>
      {message}
    </Alert>
  );
};

FormAlert.displayName = 'FormAlert';

export default FormAlert;
