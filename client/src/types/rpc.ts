// Tipi "safe" per payload/risposte RPC BadgeNode
export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type RpcOk<T> = { ok: true; data: T };
export type RpcErr = { ok: false; error: string };
export type RpcResult<T> = RpcOk<T> | RpcErr;

// Tipo neutro per record sconosciuti
export type UnknownRecord = Record<string, unknown>;

// Tipi comuni per payload Supabase
export type SupabasePayload = {
  [key: string]: Json;
};

export type TimbraturePayload = {
  pin: number;
  tipo: 'entrata' | 'uscita';
};
