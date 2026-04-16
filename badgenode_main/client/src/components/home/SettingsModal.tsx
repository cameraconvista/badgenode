import { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSuccess }: SettingsModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const ADMIN_CODE = '1909';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin === ADMIN_CODE) {
      onSuccess();
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleCancel = () => {
    setPin('');
    setError(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div
        className="rounded-2xl p-6 shadow-xl border-2 max-w-sm w-full"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(122,18,40,0.35)',
          boxShadow: '0 8px 32px rgba(122,18,40,0.15)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1C0A10]">Codice Admin</h2>
          <button onClick={handleCancel} className="text-[#7A5A64] hover:text-[#7A1228] p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="mb-6">
          <label className="block text-[#7A5A64] text-sm font-medium mb-3 text-center">
            Inserisci PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            name="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            pattern="\d*"
            aria-label="PIN amministratore"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••"
            maxLength={4}
            className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] rounded-xl border-2 bg-[#FDFAF8] text-[#1C0A10] placeholder-[#7A5A64]/50 focus:outline-none focus:ring-2 focus:ring-[#9B1E35]/30 ${
              error ? 'border-red-400 bg-red-50' : 'border-[rgba(122,18,40,0.25)]'
            }`}
            autoFocus
          />
          {error && <p className="text-red-600 text-sm text-center mt-2">PIN non valido</p>}
        </form>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-[#E8DDD5] hover:bg-[#DDD0C5] text-[#1C0A10] font-medium rounded-xl transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length === 0}
            className="flex-1 px-4 py-3 bg-[#7A1228] hover:bg-[#9B1E35] disabled:bg-[rgba(122,18,40,0.25)] disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
