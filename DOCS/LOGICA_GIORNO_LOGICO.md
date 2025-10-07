# 📅 Logica Giorno Logico - BadgeNode

## Indice

- [Concetto Base](#concetto-base)
- [Regole Calcolo](#regole-calcolo)
- [Scenari Tipici](#scenari-tipici)
- [Gestione Ore Extra](#gestione-ore-extra)
- [Implementazione](#implementazione)

---

## Concetto Base

Il **giorno logico** è il periodo lavorativo che può estendersi oltre la mezzanotte, permettendo di raggruppare timbrature che appartengono alla stessa sessione lavorativa.

### Definizione

- **Inizio**: Prima timbratura di entrata
- **Fine**: Ultima timbratura di uscita della sessione
- **Durata**: Può superare le 24 ore
- **Identificatore**: Data della prima entrata

---

## Regole Calcolo

### Determinazione Giorno Logico

```
SE prima_entrata.data = 2024-10-07 alle 08:00
ALLORA giorno_logico = 2024-10-07

ANCHE SE ultima_uscita = 2024-10-08 alle 02:00
IL giorno_logico RIMANE = 2024-10-07
```

### Soglia Separazione

- **Pausa massima**: 4 ore
- **Se pausa > 4 ore**: Nuovo giorno logico
- **Eccezione**: Turni notturni programmati

### Calcolo Ore Standard vs Extra

```
ore_standard = MIN(ore_totali, 8.0)
ore_extra = MAX(0, ore_totali - 8.0)
```

---

## Scenari Tipici

### Scenario 1: Giornata Standard

```
08:00 - Entrata
12:00 - Uscita pausa
13:00 - Rientro pausa
17:00 - Uscita finale

Giorno logico: 2024-10-07
Ore totali: 8.0
Ore standard: 8.0
Ore extra: 0.0
```

### Scenario 2: Straordinario Serale

```
08:00 - Entrata
12:00 - Uscita pausa
13:00 - Rientro pausa
20:00 - Uscita finale

Giorno logico: 2024-10-07
Ore totali: 11.0
Ore standard: 8.0
Ore extra: 3.0
```

### Scenario 3: Turno Notturno

```
22:00 (07/10) - Entrata
02:00 (08/10) - Uscita pausa
02:30 (08/10) - Rientro pausa
06:00 (08/10) - Uscita finale

Giorno logico: 2024-10-07
Ore totali: 8.0
Ore standard: 8.0
Ore extra: 0.0
```

### Scenario 4: Doppio Turno

```
08:00 (07/10) - Entrata
17:00 (07/10) - Uscita
18:00 (07/10) - Rientro
03:00 (08/10) - Uscita finale

Giorno logico: 2024-10-07
Ore totali: 17.0
Ore standard: 8.0
Ore extra: 9.0
```

---

## Gestione Ore Extra

### Tipologie

- **Straordinario**: Oltre 8 ore giornaliere
- **Notturno**: 22:00 - 06:00 (maggiorazione)
- **Festivo**: Giorni festivi (maggiorazione)
- **Weekend**: Sabato/Domenica (maggiorazione)

### Calcolo Maggiorazioni

```typescript
interface CalcoloOre {
  ore_base: number;
  ore_straordinario: number;
  ore_notturno: number;
  ore_festivo: number;
  maggiorazione_notturna: 1.25;
  maggiorazione_festiva: 1.5;
  maggiorazione_weekend: 1.3;
}
```

### Algoritmo Calcolo

```
1. Identifica fasce orarie
2. Applica maggiorazioni per fascia
3. Somma ore totali ponderate
4. Calcola compensi
```

---

## Implementazione

### Struttura Database

```sql
-- Tabella timbrature
CREATE TABLE timbrature (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ NOT NULL,
  tipo ENUM('entrata', 'uscita', 'pausa_inizio', 'pausa_fine'),
  giorno_logico DATE NOT NULL,
  note TEXT
);

-- Tabella sessioni consolidate
CREATE TABLE sessioni_lavoro (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  giorno_logico DATE NOT NULL,
  ore_standard DECIMAL(4,2),
  ore_extra DECIMAL(4,2),
  ore_notturno DECIMAL(4,2),
  ore_festivo DECIMAL(4,2),
  stato ENUM('aperta', 'chiusa', 'consolidata')
);
```

### Algoritmo Giorno Logico

```typescript
function calcolaGiornoLogico(timbrature: Timbratura[]): Date {
  // Ordina per timestamp
  const sorted = timbrature.sort((a, b) => a.timestamp - b.timestamp);

  // Prima entrata determina giorno logico
  const primaEntrata = sorted.find((t) => t.tipo === 'entrata');

  return primaEntrata.timestamp.toDateString();
}

function consolidaSessione(giorno: Date, timbrature: Timbratura[]) {
  const sessione = {
    giorno_logico: giorno,
    ore_totali: calcolaOreTotali(timbrature),
    ore_standard: Math.min(ore_totali, 8.0),
    ore_extra: Math.max(0, ore_totali - 8.0),
    ore_notturno: calcolaOreNotturne(timbrature),
    stato: 'consolidata',
  };

  return sessione;
}
```

### Validazioni

```typescript
function validaTimbratura(nuova: Timbratura, esistenti: Timbratura[]) {
  // Non può timbrare due volte consecutive lo stesso tipo
  const ultima = esistenti[esistenti.length - 1];
  if (ultima?.tipo === nuova.tipo) {
    throw new Error('Tipo timbratura non valido');
  }

  // Non può timbrare nel passato (oltre 24h)
  const ora = new Date();
  if (nuova.timestamp < ora.getTime() - 24 * 60 * 60 * 1000) {
    throw new Error('Timbratura troppo vecchia');
  }
}
```

---

## Stati Sessione

### Aperta

- Timbrature in corso
- Modifiche consentite
- Calcoli in tempo reale

### Chiusa

- Giornata terminata
- Modifiche limitate (24h)
- Pre-consolidamento

### Consolidata

- Calcoli definitivi
- Immutabile
- Pronta per payroll

---

**Nota**: Documentazione implementativa. Codice funzionale nei prossimi step.
