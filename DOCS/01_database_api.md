# 🗄️ Database & API - BadgeNode

## Indice

- [Schema Database](#schema-database)
- [Tabelle Principali](#tabelle-principali)
- [Relazioni](#relazioni)
- [API Endpoints](#api-endpoints)
- [RLS Policies](#rls-policies)

---

## Schema Database

**Provider**: Supabase PostgreSQL  
**ORM**: Drizzle ORM  
**Configurazione**: `drizzle.config.ts` + `shared/schema.ts`

### Tabelle Principali

#### `users`

- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `role` (ENUM: admin, user)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `timbrature`

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `timestamp` (TIMESTAMP)
- `tipo` (ENUM: entrata, uscita, pausa_inizio, pausa_fine)
- `note` (TEXT, NULLABLE)
- `giorno_logico` (DATE)
- `created_at` (TIMESTAMP)

#### `sessioni_lavoro`

- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `giorno_logico` (DATE)
- `ore_standard` (DECIMAL)
- `ore_extra` (DECIMAL)
- `ore_totali` (DECIMAL)
- `stato` (ENUM: aperta, chiusa, consolidata)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Relazioni

```
users (1) ──→ (N) timbrature
users (1) ──→ (N) sessioni_lavoro
sessioni_lavoro (1) ──→ (N) timbrature [via giorno_logico]
```

### Indici

- `idx_timbrature_user_giorno` ON timbrature(user_id, giorno_logico)
- `idx_timbrature_timestamp` ON timbrature(timestamp)
- `idx_sessioni_user_giorno` ON sessioni_lavoro(user_id, giorno_logico)

---

## API Endpoints

### Autenticazione

- `POST /api/auth/login` - Login utente
- `POST /api/auth/logout` - Logout utente
- `GET /api/auth/me` - Profilo utente corrente

### Timbrature

- `GET /api/timbrature` - Lista timbrature utente
- `POST /api/timbrature` - Nuova timbratura
- `GET /api/timbrature/:id` - Dettaglio timbratura
- `PUT /api/timbrature/:id` - Modifica timbratura
- `DELETE /api/timbrature/:id` - Elimina timbratura

### Sessioni Lavoro

- `GET /api/sessioni` - Lista sessioni utente
- `GET /api/sessioni/:giorno` - Sessione per giorno logico
- `POST /api/sessioni/consolida` - Consolida sessione

### Utility

- `GET /api/health` - Health check
- `GET /api/stats` - Statistiche utente

---

## RLS Policies

**Placeholder per implementazione futura**:

- Users possono vedere solo i propri dati
- Admin possono vedere tutti i dati
- Timbrature modificabili solo entro 24h
- Sessioni consolidate non modificabili

---

**Nota**: Schema descrittivo. Implementazione SQL in step successivi.
