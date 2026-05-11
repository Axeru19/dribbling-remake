---
name: project-context
description: Panoramica completa del progetto dribbling-remake — stack, architettura, convenzioni, vincoli critici e file chiave
metadata:
  type: project
---

## Stack

- **Framework**: Next.js 15.5 App Router, TypeScript strict
- **ORM**: Prisma v6.11.0 + PostgreSQL (`postgresql://dribbling:DRIBBLING@server.axeru.com:5432/dribbling`)
- **UI**: TailwindCSS, shadcn/ui components (`components/ui/`)
- **Form**: react-hook-form + zod + `@hookform/resolvers`
- **Toast**: sonner
- **Icons**: lucide-react
- **Language**: italiano (UI labels, commenti)

---

## Vincolo critico: Prisma migrations

**Non usare `prisma db push` né `prisma migrate`.** Il DB contiene view PostgreSQL (`users_wallets`, `view_reservations`) modellate come `model` in Prisma — db push tenta di crearle come tabelle e fallisce con `ERROR: relation "users_wallets" already exists`.

**Procedura corretta per modifiche schema:**
1. Editare `prisma/schema.prisma` + `prisma/views.prisma` (tenere in sync)
2. Applicare DDL via script Node + Prisma raw:
   ```js
   await prisma.$executeRawUnsafe(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS ...`);
   await prisma.$executeRawUnsafe(`CREATE OR REPLACE VIEW view_reservations AS SELECT ...`);
   ```
3. `npx prisma generate` (rigenerare client TypeScript)
4. Verificare: `npx tsc --noEmit`

**Ottenere definizione view esistente:**
```js
const r = await prisma.$queryRaw`SELECT pg_get_viewdef('view_reservations'::regclass, true)`;
```

---

## Schema — tabella `reservations`

Colonne rilevanti:
- `id` — Int PK
- `id_user` — BigInt? (FK → users)
- `user_not_registered` — String? (utente senza account)
- `id_field` — Int? (FK → fields)
- `id_status` — Int (enum `ReservationStatus`)
- `start_time`, `end_time`, `date` — DateTime
- `mixed` — Boolean?
- `room` — String?
- `notes` — String?
- `id_reservation_fixed` — BigInt? — **ID serie prenotazioni fisse settimanali** (null = singola)

---

## Enum `ReservationStatus` (`lib/enums.ts`)

```typescript
INCOMING = 1, CONFIRMED = 2, REJECTED = 3, DELETED = 4
```

---

## Convenzioni BigInt / serializzazione

Prisma restituisce `BigInt` per campi come `id_user`, `id_reservation_fixed`. La funzione `normalizeIds()` (`utils/normalizeIds.ts`) converte ricorsivamente tutti i BigInt → Number prima di rispondere al client. Quando si ripassano questi valori all'API, vanno riconvertiti con `BigInt(value)` per le query Prisma.

---

## Timezone — pattern `toLocalTimeDate`

```typescript
// utils/localedate.ts
export function toLocalTimeDate(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}
```

Le date vengono memorizzate come orario locale (senza conversione UTC esplicita). Nel route `insert-fixed`, il pattern `new Date(today.getTime() - today.getTimezoneOffset() * 60000)` serve ad allineare l'orario locale nel timestamp.

---

## Prenotazioni fisse (serie settimanale)

- `id_reservation_fixed`: BigInt generato con `BigInt(Date.now())` — identifica la serie
- Endpoint creazione: `POST /api/reservations/insert-fixed` — accetta `{ user, weeks }`, crea N prenotazioni via `prisma.$transaction`, una per settimana
- Eliminazione serie: `PUT /api/reservations/fixed/[seriesId]/status` — `updateMany` su `id_reservation_fixed`
- Propagazione orario: `PUT /api/reservations/[id]` — se `updateSeries === true` nel body, aggiorna `start_time`/`end_time` (solo HH:MM) di tutte le altre prenotazioni della serie

---

## Colori UI — prenotazioni fisse vs singole

| Tipo | Colore |
|------|--------|
| Singola | `primary` (blu) |
| Fissa (serie) | `amber-500` (arancione) |

Applicato in: `DayView.tsx`, `WeekView.tsx` (EventBlock), badge in `[id]/page.tsx`.

---

## API routes principali (`app/api/reservations/`)

| Route | Metodo | Funzione |
|-------|--------|----------|
| `[id]/route.ts` | POST | Fetch singola prenotazione |
| `[id]/route.ts` | PUT | Aggiorna prenotazione (+ opz. serie) |
| `[id]/status/route.ts` | PUT | Cambia stato (es. DELETED) |
| `insert/route.ts` | POST | Crea prenotazione singola |
| `insert-fixed/route.ts` | POST | Crea serie fissa settimanale |
| `fixed/[seriesId]/status/route.ts` | PUT | Cambia stato tutta la serie |
| `list/route.ts` | POST | Lista prenotazioni |

---

## Componenti chiave

| Componente | File | Note |
|-----------|------|------|
| `ReservationDetailForm` | `components/ReservationDetailForm.tsx` | Form modifica dettagli; toggle "Aggiorna serie" visibile se fissa |
| `ReservationUserSelection` | `components/ReservationUserSelection.tsx` | Selezione utente + toggle "Prenotazione fissa" + contatore settimane |
| `ReservationStatusBadge` | `components/ReservationStatusBadge.tsx` | Badge stato, size `sm`/`md` (`px-3 py-1.5 text-sm` per md) |
| `DeleteReservationButton` | `components/deletereservation-button.tsx` | Alert dialog elimina singola |
| `DeleteSeriesButton` | `components/DeleteSeriesButton.tsx` | Alert dialog elimina serie (amber) |
| `DayView` / `WeekView` | `app/dashboard/partite/` | Calendar views; EventBlock colorato per tipo |

---

## Pagina dettaglio partita (`app/dashboard/partite/[id]/page.tsx`)

- Route `new` → mostra `ReservationUserSelection`
- Route `[id]` → carica prenotazione, mostra `ReservationDetailForm` + `ReservationPaymentsTable`
- Header con badge stato + badge "Fissa" amber (se `id_reservation_fixed != null`) + `DeleteSeriesButton` + `DeleteReservationButton`

---

## Prisma views (`prisma/views.prisma` + `prisma/schema.prisma`)

`view_reservations` e `users_wallets` sono **SQL view PostgreSQL**, non tabelle. Modellate come `model` Prisma per la type generation. Non gestite da migration — aggiornare con `CREATE OR REPLACE VIEW`. Script `merge-views.js` sincronizza `views.prisma` → `schema.prisma` durante db-pull.

---

## Errori noti su Windows

- `EPERM: operation not permitted, rename ...query_engine-windows.dll.node.tmp...` durante `prisma generate`: causato dal dev server che tiene il file in lock. Soluzione: fermare il dev server o riprovare.
