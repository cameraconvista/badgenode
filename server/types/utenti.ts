export type UtenteInsert = {
  pin: number; // 1..99
  nome: string;
  cognome: string;
  created_at: string; // ISO string
  // Opzionali: includere solo se esistono realmente nello schema DB
  email?: string | null;
  telefono?: string | null;
  descrizione_contratto?: string | null;
  ore_max_giornaliere?: number | null;
};
