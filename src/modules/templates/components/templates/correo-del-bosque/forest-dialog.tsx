import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import styles from './forest-gift.module.css';

export function ForestDialog({ label, children, onClose, wide = false }: { label: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog ref={ref} className={styles.dialog} data-wide={wide} aria-label={label} onCancel={onClose}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Volver al bosque"><X size={19} /><span>Volver al bosque</span></button>
      {children}
    </dialog>
  );
}
