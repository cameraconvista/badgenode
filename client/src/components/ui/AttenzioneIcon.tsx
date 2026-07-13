/**
 * Icona tonda "attenzione" (PNG in client/public/icona-attenzione.png).
 * Usata per gli avvisi ambra di anomalia oraria nello Storico
 * (marcatore inline accanto al giorno + box di dettaglio).
 */
export default function AttenzioneIcon({ className = '' }: { className?: string }) {
  return <img src="/icona-attenzione.png" alt="" aria-hidden="true" className={className} />;
}
