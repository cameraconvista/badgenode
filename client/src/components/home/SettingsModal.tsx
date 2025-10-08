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
        className="rounded-2xl p-6 shadow-2xl border-2 max-w-sm w-full"
        style={{
          backgroundColor: '#2b0048',
          borderColor: 'rgba(231, 116, 240, 0.5)',
          boxShadow: '0 0 20px rgba(231, 116, 240, 0.3)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Codice Admin</h2>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-300 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-white text-sm font-medium mb-3 text-center">
            Inserisci PIN
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••"
            maxLength={4}
            className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] rounded-xl border-2 bg-white/95 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            autoFocus
          />
          {error && (
            <p className="text-red-300 text-sm text-center mt-2">
              PIN non valido
            </p>
          )}
        </form>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length === 0}
            className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
