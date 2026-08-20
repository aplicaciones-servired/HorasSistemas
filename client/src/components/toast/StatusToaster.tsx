import { useEffect, useRef } from 'react';
import type { StatusType } from '../../types/domain';
import { useToast } from './useToast';

interface StatusToasterProps {
  status: { type: StatusType; message: string };
}

export const StatusToaster = ({ status }: StatusToasterProps) => {
  const toast = useToast();
  const handled = useRef<{ type: StatusType; message: string } | null>(null);

  useEffect(() => {
    if (status.type === 'idle' || handled.current === status) {
      return;
    }

    handled.current = status;
    toast[status.type](status.message);
  }, [status, toast]);

  return null;
};
