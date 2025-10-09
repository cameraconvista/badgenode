# 🔒 SUPABASE POLICIES CHECKLIST - BadgeNode

**Versione:** 1.0  
**Data:** 09 Ottobre 2025  
**Progetto:** BadgeNode - Sistema di timbratura con PIN

---

## 📋 CHECKLIST POLICIES RLS

### Tabella: `timbrature`

#### Obiettivo d'Accesso
- **Utenti:** Lettura delle proprie timbrature, inserimento nuove timbrature
- **Admin:** Lettura globale, modifica/eliminazione per gestione

#### Operazioni Permesse
| Operazione | Utente Standard | Admin | Policy Suggerita |
|------------|----------------|-------|------------------|
| **SELECT** | ✅ Proprie (pin) | ✅ Tutte | `pin = auth.pin OR is_admin()` |
| **INSERT** | ✅ Proprie (pin) | ✅ Tutte | `pin = auth.pin OR is_admin()` |
| **UPDATE** | ❌ Negato | ✅ Tutte | `is_admin()` |
| **DELETE** | ❌ Negato | ✅ Tutte | `is_admin()` |

#### Rischi Identificati
- **Lettura cross-PIN:** Utente potrebbe leggere timbrature altrui
- **Inserimento fraudolento:** Timbrature per PIN non proprio
- **Modifica storico:** Alterazione dati senza tracciabilità

#### Da Confermare in Dashboard
- [ ] Policy SELECT con filtro PIN
- [ ] Policy INSERT con validazione PIN
- [ ] Policy UPDATE solo admin
- [ ] Policy DELETE solo admin
- [ ] Funzione `is_admin()` implementata

---

### Tabella: `utenti`

#### Obiettivo d'Accesso
- **Utenti:** Lettura anagrafica per lista dipendenti
- **Admin:** CRUD completo per gestione dipendenti

#### Operazioni Permesse
| Operazione | Utente Standard | Admin | Policy Suggerita |
|------------|----------------|-------|------------------|
| **SELECT** | ✅ Anagrafica pubblica | ✅ Completa | `true` (pubblico) |
| **INSERT** | ❌ Negato | ✅ Nuovi dipendenti | `is_admin()` |
| **UPDATE** | ❌ Negato | ✅ Modifiche | `is_admin()` |
| **DELETE** | ❌ Negato | ✅ Archiviazione | `is_admin()` |

#### Rischi Identificati
- **Modifica anagrafica:** Utenti non dovrebbero modificare dati
- **Creazione account:** Solo admin può aggiungere dipendenti
- **Eliminazione dati:** Perdita informazioni senza backup

#### Da Confermare in Dashboard
- [ ] Policy SELECT pubblica
- [ ] Policy INSERT solo admin
- [ ] Policy UPDATE solo admin  
- [ ] Policy DELETE solo admin
- [ ] Trigger per archiviazione in `ex_dipendenti`

---

### Tabella: `ex_dipendenti`

#### Obiettivo d'Accesso
- **Utenti:** Nessun accesso diretto
- **Admin:** Lettura archivio per storico

#### Operazioni Permesse
| Operazione | Utente Standard | Admin | Policy Suggerita |
|------------|----------------|-------|------------------|
| **SELECT** | ❌ Negato | ✅ Archivio | `is_admin()` |
| **INSERT** | ❌ Negato | ✅ Via trigger | `is_admin()` |
| **UPDATE** | ❌ Negato | ❌ Immutabile | `false` |
| **DELETE** | ❌ Negato | ❌ Permanente | `false` |

#### Rischi Identificati
- **Accesso non autorizzato:** Dati sensibili ex-dipendenti
- **Modifica archivio:** Alterazione storico archiviazione
- **Eliminazione permanente:** Perdita tracciabilità

#### Da Confermare in Dashboard
- [ ] Policy SELECT solo admin
- [ ] Policy INSERT solo admin/trigger
- [ ] Policy UPDATE negata
- [ ] Policy DELETE negata
- [ ] Trigger automatico da `utenti.DELETE`

---

### Vista: `v_turni_giornalieri`

#### Obiettivo d'Accesso
- **Utenti:** Lettura aggregazioni per storico personale
- **Admin:** Lettura globale per dashboard e report

#### Operazioni Permesse
| Operazione | Utente Standard | Admin | Policy Suggerita |
|------------|----------------|-------|------------------|
| **SELECT** | ✅ Proprie (pin) | ✅ Tutte | `pin = auth.pin OR is_admin()` |

#### Rischi Identificati
- **Lettura cross-PIN:** Accesso a statistiche altri dipendenti
- **Performance:** Query non ottimizzate su range ampi

#### Da Confermare in Dashboard
- [ ] Policy SELECT con filtro PIN
- [ ] Vista materializzata per performance
- [ ] Indici su `pin, giornologico`

---

## 🔧 FUNZIONI HELPER RICHIESTE

### Funzione: `is_admin()`
```sql
-- Da implementare in Supabase
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Logica per determinare se l'utente corrente è admin
  -- Opzioni:
  -- 1. Basata su ruolo in auth.users
  -- 2. Basata su claim JWT custom
  -- 3. Basata su tabella admin separata
  RETURN false; -- Placeholder
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Funzione: `get_current_pin()`
```sql
-- Da implementare per mappare auth.uid -> pin
CREATE OR REPLACE FUNCTION get_current_pin()
RETURNS INTEGER AS $$
BEGIN
  -- Logica per ottenere PIN dell'utente autenticato
  -- Mappatura auth.uid -> utenti.pin
  RETURN null; -- Placeholder
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 MATRICE PERMISSIONS

### Riepilogo Accessi per Ruolo

#### Utente Standard (ANON Key)
| Tabella | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| `timbrature` | ✅ Proprie | ✅ Proprie | ❌ | ❌ |
| `utenti` | ✅ Pubblico | ❌ | ❌ | ❌ |
| `ex_dipendenti` | ❌ | ❌ | ❌ | ❌ |
| `v_turni_giornalieri` | ✅ Proprie | - | - | - |

#### Admin (Service Role o Admin Flag)
| Tabella | SELECT | INSERT | UPDATE | DELETE |
|---------|--------|--------|--------|--------|
| `timbrature` | ✅ Tutte | ✅ Tutte | ✅ Tutte | ✅ Tutte |
| `utenti` | ✅ Tutte | ✅ Nuovi | ✅ Modifiche | ✅ Archivia |
| `ex_dipendenti` | ✅ Archivio | ✅ Via trigger | ❌ | ❌ |
| `v_turni_giornalieri` | ✅ Tutte | - | - | - |

---

## ✅ CHECKLIST VERIFICA

### Pre-Implementazione
- [ ] Definire strategia autenticazione (ANON vs AUTH)
- [ ] Implementare funzioni helper (`is_admin`, `get_current_pin`)
- [ ] Pianificare mapping utenti → PIN
- [ ] Definire ruoli admin

### Post-Implementazione  
- [ ] Testare ogni policy con utenti diversi
- [ ] Verificare filtri RLS su query complesse
- [ ] Monitorare performance con policies attive
- [ ] Documentare comportamenti edge case

### Monitoring Continuo
- [ ] Alert su violazioni RLS
- [ ] Audit log accessi sensibili
- [ ] Performance monitoring query filtrate
- [ ] Review periodica permissions

---

## 🚨 NOTE CRITICHE

### Sicurezza
1. **Mai esporre Service Role Key** nel client
2. **Testare sempre policies** prima del deploy
3. **Backup permissions** prima di modifiche
4. **Principio least privilege** per tutti i ruoli

### Performance
1. **Indici su colonne filtrate** da RLS
2. **Materializzare viste** se query complesse
3. **Monitorare query lente** con policies attive
4. **Cache risultati** dove possibile

### Manutenibilità
1. **Versionare policies** nel repository
2. **Documentare logica business** nelle policies
3. **Test automatici** per regressioni permissions
4. **Procedure rollback** per emergenze

---

*Checklist generata automaticamente il 09/10/2025 alle 03:32*  
*Da completare con verifica manuale in Supabase Dashboard*
