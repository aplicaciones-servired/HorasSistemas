import { useContext } from 'react';
import { ConfirmContext, type ConfirmContextValue } from './ConfirmContext';

export const useConfirm = (): ConfirmContextValue => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  }

  return context;
};
