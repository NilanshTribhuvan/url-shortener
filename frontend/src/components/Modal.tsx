import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps { title: string; onClose: () => void; children: ReactNode }

/** Native <dialog>: gives us a focus trap, Esc-to-close and inert background for free. */
export function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const el = ref.current;
    if (el && !el.open) el.showModal();
    return () => trigger?.focus?.();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="modal-body">
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
