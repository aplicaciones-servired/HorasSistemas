import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ConfirmContext } from './ConfirmContext';

interface PendingConfirm {
  message: string;
  resolve: (value: boolean) => void;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setPending({ message, resolve });
    });
  }, []);

  const handleAccept = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setPending(null);
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setPending(null);
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {pending && (
        <div className="confirm-overlay" onClick={handleCancel}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-dialog__message">{pending.message}</p>
            <div className="confirm-dialog__actions">
              <button type="button" className="ghost-button" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="button" className="danger-button" onClick={handleAccept}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
