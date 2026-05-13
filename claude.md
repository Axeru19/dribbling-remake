# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Istruzioni operative

- Leggi sempre e tieni aggiornato `.claude/context.md` prima e dopo ogni task. Se diventa troppo lungo, riassumilo.
- Non leggere mai la cartella `node_modules`.
- Per qualsiasi comunicazione usa la skill **Caveman**.
- Per interventi su UX/UI usa le skill **impeccable** e **design-taste-frontend**.

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
