import { useCallback } from 'react';
import { useToast } from '../components/Toast';

export function useCopy() {
  const { notify } = useToast();
  return useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied to clipboard');
    } catch {
      notify('Could not copy. Select the link and copy it manually.', 'error');
    }
  }, [notify]);
}
