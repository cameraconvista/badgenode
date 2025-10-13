/**
 * ColGroup condiviso per tabella Storico Timbrature
 * Unica fonte di verità per larghezze colonne
 */
export default function ColGroupStorico() {
  return (
    <colgroup>
      <col className="w-28" /> {/* Data */}
      <col className="w-28" /> {/* Mese */}
      <col className="w-20" /> {/* Entrata */}
      <col className="w-20" /> {/* Uscita */}
      <col className="w-16" /> {/* Ore */}
      <col className="w-16" /> {/* Extra */}
      <col className="w-12" /> {/* Modifica */}
    </colgroup>
  );
}
