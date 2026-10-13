import { useId } from 'react';

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Toggle({ label, checked, onChange }: ToggleProps) {
  const labelId = useId();

  return (
    <div className="toggle-field">
      <span id={labelId} className="toggle-label">{label}</span>
      <button
        className="toggle-button"
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-track" aria-hidden="true">
          <span className="toggle-knob" />
        </span>
      </button>
      <span className="toggle-state" aria-hidden="true">{checked ? 'On' : 'Off'}</span>
    </div>
  );
}
