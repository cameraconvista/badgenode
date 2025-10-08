import { useState } from 'react';
import { X } from 'lucide-react';
import KeyButton from './KeyButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSuccess }: SettingsModalProps) {
  const [code, setCode] = useState('');
  const ADMIN_CODE = '1909';

  const handleKeyPress = (key: string) => {
    if (code.length < 4) {
      setCode(code + key);
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleSubmit = () => {
    if (code === ADMIN_CODE) {
      onSuccess();
      setCode('');
      onClose();
    } else {
      setCode('');
      // Could add error feedback here
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '✓'],
  ];

  const handlePress = (key: string) => {
    if (key === 'C') {
      handleClear();
    } else if (key === '✓') {
      handleSubmit();
    } else {
      handleKeyPress(key);
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
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Codice Admin</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white/90 rounded-xl px-4 py-3 text-center mb-6">
          <div className="text-2xl font-mono tracking-[0.4em] min-h-[2rem] flex items-center justify-center text-gray-600">
            {code.length > 0 ? '•'.repeat(code.length) : 'CODICE'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {keys.flat().map((key) => (
            <KeyButton
              key={key}
              value={key}
              onClick={handlePress}
              className="w-12 h-12 text-base"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
