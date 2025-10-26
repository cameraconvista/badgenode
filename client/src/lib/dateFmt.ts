// Utility per formattazione date per input HTML
export function toInputDate(v?: string | Date | null): string {
  if (!v) return '';
  try {
    const d = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`; // formato richiesto da <input type="date">
  } catch { 
    return ''; 
  }
}

function fromInputDate(dateStr: string): string | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  return dateStr; // già in formato corretto
}
