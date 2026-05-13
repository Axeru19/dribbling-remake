# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Istruzioni operative

- Non leggere mai la cartella `node_modules`.
- Per qualsiasi comunicazione usa la skill **Caveman**.

## Comandi

```bash
npm run dev          # dev server con Turbopack
npm run build        # build produzione
npm run lint         # ESLint
npx tsc --noEmit     # type-check senza build

# Prisma — LEGGI I VINCOLI QUI SOTTO prima di usare
npm run db-pull      # prisma db pull + merge-views.js (sincronizza views)
npx prisma generate  # rigenera client TypeScript dopo modifiche schema
```

## Architettura

**Stack:** Next.js 15.5 App Router · TypeScript strict · Prisma v6 + PostgreSQL · NextAuth v4 (JWT) · shadcn/ui · Tailwind v4 · tw-animate-css · lucide-react · sonner (toast) · react-hook-form + zod

**Layout dashboard** (`app/dashboard/layout.tsx`):
- `main` = `h-dvh flex flex-col overflow-hidden`
- Header fisso (`shrink-0`)
- Content wrapper = `flex-1 overflow-auto p-6` — i children ricevono questa altezza

**Pagine dashboard principali:**
- `partite/` — calendario prenotazioni (DayView, WeekView)
- `partite/[id]/` — dettaglio singola partita
- `nuova-prenotazione/` — wizard 4 step per creare prenotazione
- `le-mie-prenotazioni/` — lista prenotazioni utente
- `prenotazioni/` — lista admin
- `utenti/`, `campi/`, `pagamenti/`, `portafoglio/`, `profilo/`

**Providers context** (`context/`):
- `FieldsProvider` — lista campi attivi, caricata server-side nel layout e passata via context
- `SessionProviderWrapper` — wrap di NextAuth SessionProvider

**Auth** (`lib/auth.ts`): JWT strategy, credentials provider (email + bcrypt), `role_id` nel token (`UserRole.ADMIN=2`, `UserRole.USER=1`)

**Enum** (`lib/enums.ts`): `ReservationStatus` (INCOMING=1, CONFIRMED=2, REJECTED=3, DELETED=4), `UserRole`, `WalletUpdateType`

**Slot disponibili**: calcolati via funzione PostgreSQL `get_available_slots(date, id_field)` chiamata con `prisma.$queryRaw`. Slot base in `lib/constants.ts`.

## Vincolo critico — Prisma e le view

**Non usare mai `prisma db push` né `prisma migrate dev/deploy`.**

Il DB contiene view PostgreSQL (`view_reservations`, `users_wallets`) modellate come `model` in Prisma. Un `db push` tenta di crearle come tabelle e fallisce con `ERROR: relation already exists`.

**Procedura corretta per modifiche allo schema:**
1. Modifica `prisma/schema.prisma` e `prisma/views.prisma` (tenerli in sync)
2. Applica DDL direttamente via `prisma.$executeRawUnsafe()`
3. `npx prisma generate`
4. `npx tsc --noEmit`

`merge-views.js` sincronizza `views.prisma` → `schema.prisma` durante `db-pull`.

## BigInt e serializzazione

Prisma restituisce `BigInt` per `id`, `id_user`, `id_reservation_fixed`. 

- **Prima di rispondere al client**: `normalizeIds(result)` (`utils/normalizeIds.ts`) — converte tutti i BigInt in Number ricorsivamente.
- **Prima di passare a Prisma**: riconvertire con `BigInt(value)`.

## Timezone

Le date sono memorizzate come orario locale (no UTC esplicito). Pattern per allineare:

```ts
new Date(date.getTime() - date.getTimezoneOffset() * 60000)
```

## Prenotazioni fisse (serie settimanale)

`id_reservation_fixed = BigInt(Date.now())` identifica la serie. Endpoint `POST /api/reservations/insert-fixed` crea N prenotazioni in transaction. Per aggiornare/eliminare tutta la serie: `updateMany` su `id_reservation_fixed`.

## Colori UI

| Tipo | Colore |
|------|--------|
| Prenotazione singola | `primary` (blu) |
| Prenotazione fissa (serie) | `amber-500` (arancione) |

## API routes (`app/api/`)

| Route | Metodo | Funzione |
|-------|--------|----------|
| `reservations/send` | POST | Crea prenotazione singola |
| `reservations/insert-fixed` | POST | Crea serie fissa |
| `reservations/list` | POST | Lista prenotazioni |
| `reservations/[id]` | POST/PUT | Fetch / aggiorna |
| `reservations/[id]/status` | PUT | Cambia stato |
| `reservations/fixed/[seriesId]/status` | PUT | Cambia stato intera serie |
| `slot/available` | POST | Slot liberi (`get_available_slots`) |
| `fields/list` | GET | Lista campi |
| `users/[id]` | GET/PUT | Fetch / aggiorna utente |
| `wallets/[id]` | GET/PUT | Portafoglio |

## Note implementative

Questa sezione raccoglie decisioni tecniche non ovvie emerse durante lo sviluppo.

### Portafoglio — pagamento prenotazioni (`app/dashboard/portafoglio/`)

**GET saldo**: `GET /api/wallets/[id]` dove `[id]` = **user ID** (non wallet ID). Query su view `users_wallets` (`findUnique({ where: { user_id: Number(id) } })`). Campi: `user_id`, `wallet_id Int?`, `balance Float?`.

**Flow pagamento** (state machine `PayStep`):
1. `POST /api/reservations/${id}` con body `{ id: Number(id) }` — fetch prenotazione
2. Validare: `String(data.id_user) === String(user.id)` + `id_status === ReservationStatus.CONFIRMED`
3. `PUT /api/wallets/${wallet.wallet_id}` con `{ type: WalletUpdateType.SUBTRACT, amount: number }`

**Nessun campo prezzo** nelle prenotazioni → l'utente inserisce l'importo manualmente.

**TypeScript narrowing**: dentro `{payStep === "found" && ...}` TS narra payStep come `"found"`, comparare con `"paying"` causa errore. Fix: `(payStep === "found" || payStep === "paying") && ...`.

**Date/time format**: `date` → `"2024-01-15T00:00:00.000Z"` (usa `format()` da date-fns). `start_time`/`end_time` → `"1970-01-01T10:30:00.000Z"` (estrarre `.toISOString().substring(11, 16)`).
