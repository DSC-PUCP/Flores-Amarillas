import { useId } from 'react';
import { cn } from '@/lib/utils';
import { GIFT_MASCOTS, type GiftMascot } from '../mascots';
import styles from '../premium.module.css';
import { AnimalGift } from './animal-gift';

export function MascotPicker({
  value,
  onChange,
  compact = false,
  label = '¿Quién entregará tus flores?',
}: {
  value: GiftMascot;
  onChange: (mascot: GiftMascot) => void;
  compact?: boolean;
  label?: string;
}) {
  const name = useId();
  return (
    <fieldset
      className={cn(styles.mascotPicker, compact && styles.mascotPickerCompact)}
    >
      <legend>{label}</legend>
      <div className={styles.mascotOptions}>
        {GIFT_MASCOTS.map((option) => (
          <label key={option.value} className={styles.mascotOption}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={styles.mascotRadio}
            />
            <AnimalGift mascot={option.value} />
            <span>{option.label}</span>
            <span className={styles.mascotCheck} aria-hidden="true">
              ✓
            </span>
          </label>
        ))}
      </div>
      {compact && (
        <p className={styles.mascotPickerHint}>Desliza para verlos todos</p>
      )}
    </fieldset>
  );
}
