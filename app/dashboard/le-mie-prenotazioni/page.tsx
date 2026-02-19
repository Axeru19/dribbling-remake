"use client";

import DeleteReservationButton from "@/components/deletereservation-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import { AppUser } from "@/types/types";
import { view_reservations } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Layers,
  Users2,
  FileText,
  CalendarX,
  Inbox,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Metadati visuali associati ad ogni stato di prenotazione.
 */
interface StatusMeta {
  label: string;
  color: string;
  /** Classe Tailwind per il ring/sfondo tenue sulla card */
  ringClass: string;
}

// ─── Dizionario degli stati ───────────────────────────────────────────────────

const STATUS_META: Record<ReservationStatus, StatusMeta> = {
  [ReservationStatus.INCOMING]: {
    label: "In arrivo",
    color: ReservationStatusColor.INCOMING,
    ringClass: "border-blue-400/40 bg-blue-50/30 dark:bg-blue-950/20",
  },
  [ReservationStatus.CONFIRMED]: {
    label: "Confermata",
    color: ReservationStatusColor.CONFIRMED,
    ringClass: "border-green-400/40 bg-green-50/30 dark:bg-green-950/20",
  },
  [ReservationStatus.REJECTED]: {
    label: "Rifiutata",
    color: ReservationStatusColor.REJECTED,
    ringClass: "border-orange-400/40 bg-orange-50/30 dark:bg-orange-950/20",
  },
  [ReservationStatus.DELETED]: {
    label: "Eliminata",
    color: ReservationStatusColor.DELETED,
    ringClass: "border-red-400/40 bg-red-50/30 dark:bg-red-950/20",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Skeleton card mostrato durante il caricamento delle prenotazioni.
 */
function ReservationSkeleton() {
  return (
    <Card className="border shadow-sm animate-pulse">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-36 rounded bg-accent" />
            <div className="h-3 w-24 rounded bg-accent" />
          </div>
          <div className="h-6 w-20 rounded-full bg-accent" />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-3 w-28 rounded bg-accent" />
          <div className="h-3 w-20 rounded bg-accent" />
        </div>
        <div className="h-8 w-full rounded bg-accent" />
      </CardContent>
    </Card>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

/**
 * Stato vuoto mostrato quando l'utente non ha prenotazioni.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center col-span-full">
      <div className="p-5 rounded-full bg-accent/60">
        <Inbox className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Nessuna prenotazione</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Non hai ancora effettuato prenotazioni. Vai su{" "}
          <span className="font-medium text-primary">Nuova Prenotazione</span>{" "}
          per iniziare.
        </p>
      </div>
    </div>
  );
}

// ─── ReservationCard ──────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: view_reservations;
  onDelete: (id: number) => void;
}

/**
 * Card singola per una prenotazione.
 * Mostra: data, campo, orario, tipo squadre, note e badge di stato.
 * Azioni: Paga (solo se confermata) e Elimina.
 */
function ReservationCard({ reservation, onDelete }: ReservationCardProps) {
  const status = reservation.id_status as ReservationStatus;
  const meta = STATUS_META[status] ?? STATUS_META[ReservationStatus.INCOMING];

  // Formattazione degli orari dalla stringa ISO
  const startLabel = new Date(reservation.start_time)
    .toISOString()
    .split("T")[1]
    .substring(0, 5);
  const endLabel = new Date(reservation.end_time)
    .toISOString()
    .split("T")[1]
    .substring(0, 5);

  // La prenotazione può essere eliminata solo se non è già eliminata o rifiutata
  const canDelete =
    status !== ReservationStatus.DELETED &&
    status !== ReservationStatus.REJECTED;

  // Il pagamento è disponibile solo per prenotazioni confermate
  const canPay = status === ReservationStatus.CONFIRMED;

  return (
    <Card
      className={`border-2 shadow-sm transition-all duration-200 hover:shadow-md ${meta.ringClass}`}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        {/* ── Header: data + badge stato ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            {/* Data della partita */}
            <p className="font-semibold text-sm leading-tight capitalize">
              {format(new Date(reservation.date), "EEEE d MMMM yyyy", {
                locale: it,
              })}
            </p>
            {/* ID prenotazione in tono discreto */}
            <p className="text-xs text-muted-foreground">#{reservation.id}</p>
          </div>

          {/* Badge stato colorato */}
          <Badge
            className="shrink-0 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </Badge>
        </div>

        <Separator />

        {/* ── Dettagli: campo, orario, tipo squadre ─────────────────────── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {/* Campo */}
          <div className="flex items-center gap-2 text-sm">
            <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">
              {reservation.description ?? "—"}
            </span>
          </div>

          {/* Tipo squadre */}
          <div className="flex items-center gap-2 text-sm">
            <Users2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              {reservation.mixed ? "Squadre miste" : "Squadre omogenee"}
            </span>
          </div>

          {/* Orario — occupa tutta la riga */}
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="font-mono font-semibold">
              {startLabel} – {endLabel}
            </span>
          </div>
        </div>

        {/* ── Note (solo se presenti) ────────────────────────────────────── */}
        {reservation.notes && (
          <div className="flex items-start gap-2 rounded-lg bg-accent/40 px-3 py-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reservation.notes}
            </p>
          </div>
        )}

        {/* ── Azioni ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-1">
          {/* Paga: visibile solo se la prenotazione è confermata */}
          {canPay && (
            <Button size="sm" className="flex-1 gap-1.5 text-xs font-semibold">
              <CreditCard className="w-3.5 h-3.5" />
              Paga
            </Button>
          )}

          {/* Elimina: nascosto se già eliminata o rifiutata */}
          {canDelete && (
            <DeleteReservationButton
              deleteReservation={() => onDelete(reservation.id)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeMiePrenotazioniPage() {
  const user = useSession().data?.user as AppUser | undefined;

  const [reservations, setReservations] = useState<view_reservations[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch prenotazioni dell'utente ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    fetch("/api/reservations/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_user: user.id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Errore di rete");
        return res.json() as Promise<view_reservations[]>;
      })
      .then(setReservations)
      .catch(() =>
        toast.error("Errore durante il caricamento delle prenotazioni"),
      )
      .finally(() => setLoading(false));
  }, [user?.id]);

  /**
   * Imposta lo stato della prenotazione a DELETED chiamando la route
   * PUT /api/reservations/{id}/status.
   * Applica un aggiornamento ottimistico immediato sulla lista locale:
   * se la chiamata fallisce, ripristina lo stato precedente e avvisa l'utente.
   */
  function handleDelete(id: number) {
    fetch(`/api/reservations/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: ReservationStatus.DELETED }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success("Prenotazione eliminata con successo");
      })
      .catch(() => {
        toast.error("Errore durante l'eliminazione della prenotazione");
      });
  }

  return (
    <div className="w-full h-full flex flex-col gap-5 overflow-y-auto overflow-x-hidden pb-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Le mie prenotazioni
        </h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Caricamento in corso..."
            : reservations.length === 0
              ? "Nessuna prenotazione trovata"
              : `${reservations.length} prenotazion${reservations.length === 1 ? "e" : "i"}`}
        </p>
      </div>

      {/* ── Griglia prenotazioni ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          /* Skeleton durante il caricamento */
          Array.from({ length: 3 }).map((_, i) => (
            <ReservationSkeleton key={i} />
          ))
        ) : reservations.length === 0 ? (
          /* Empty state */
          <EmptyState />
        ) : (
          /* Lista prenotazioni */
          reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
