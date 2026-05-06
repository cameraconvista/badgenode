# Server Legacy Modules

**Status**: HISTORICAL / NON CANONICAL  
**Purpose**: segnaposto storico per materiale legacy eventualmente riallocato fuori dal runtime attivo

## Stato reale

Nel repository corrente non ci sono moduli server attivi in questa cartella. Il runtime reale usa:
- `server/start.ts`
- `server/createApp.ts`
- `server/routes.ts`
- `server/routes/**`

## Istruzioni

1. Non importare nulla da questa cartella nel codice attivo.
2. Trattare questo README come nota storica locale, non come documentazione canonica.
3. Se in futuro questa cartella torna a contenere file, riallineare prima `DNA/` e `README_OPERATIVO.md`.
