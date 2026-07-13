/**
 * Toggle (switch) on/off coerente col tema app.
 * ON = verde app (#3E7D52), OFF = grigio neutro. Accessibile (role switch).
 */
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export default function Toggle({ checked, onChange, disabled, ...aria }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={aria['aria-label']}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3E7D52]/40 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-[#3E7D52]' : 'bg-[#D8CFC7]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}
