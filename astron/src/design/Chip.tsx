import type { ButtonHTMLAttributes } from 'react';

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> & {
  selected?: boolean;
};

export function Chip({ selected = false, className = '', type = 'button', ...props }: ChipProps) {
  return <button {...props} type={type} aria-pressed={selected} className={`atlas-chip ${className}`} />;
}
