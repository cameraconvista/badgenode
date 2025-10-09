import { useEffect, useState } from 'react';

interface DateTimeLiveProps {
  className?: string;
}

export default function DateTimeLive({ className = "" }: DateTimeLiveProps) {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];

    return `${dayName} ${day} ${monthName}`;
  };

  const formatTime = (date: Date) => {
    // Formato HH:MM:SS (equivalente a timeStyle: 'medium')
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={`text-center mb-4 ${className}`} data-testid="text-datetime">
      <div className="text-white text-base font-semibold mb-1 drop-shadow-sm" style={{ filter: 'brightness(1.2)' }}>
        {formatDate(dateTime)}
      </div>
      <div 
        className="text-2xl md:text-3xl font-bold tracking-wide"
        style={{ color: '#d8b4fe' }}
      >
        {formatTime(dateTime)}
      </div>
    </div>
  );
}
