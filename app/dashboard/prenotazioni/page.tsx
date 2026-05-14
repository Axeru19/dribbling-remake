"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { view_reservations } from "@prisma/client";
import {
  Calendar,
  Clock,
  Layers,
  Phone,
  Users2,
  FileText,
  CheckCircle2,
  XCircle,
  Inbox,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ReservationActionDialog from "@/components/ReservationActionDialog";
import { ReservationPostRequest } from "@/types/types";
import { ReservationStatus } from "@/lib/enums";

// ─── Costante della query iniziale ────────────────────────────────────────────

/** Fetch solo le prenotazioni "In arrivo" (status = INCOMING) */
const INCOMING_FILTER: ReservationPostRequest = {
  id_status: ReservationStatus.INCOMING,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Placeholder animato mostrato durante il caricamento iniziale.
 */
function ReservationSkeleton() {
  return (
    <Card className="border border-border/60 shadow-sm animate-pulse gap-0 py-0">
      <CardHeader className="px-5 pt-4 pb-0 flex flex-row items-center gap-3 space-y-0">
        <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 w-32 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="h-6 w-20 rounded-full bg-muted" />
      </CardHeader>
      <CardContent className="px-5 py-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-28 rounded bg-muted col-span-2" />
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-4 pt-3 gap-2 border-t border-border/50">
        <div className="h-8 flex-1 rounded bg-muted" />
        <div className="h-8 flex-1 rounded bg-muted" />
        <div className="h-8 flex-[2] rounded bg-muted" />
      </CardFooter>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

/**
 * Schermata vuota quando non ci sono prenotazioni in arrivo.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center col-span-full">
      <div className="p-5 rounded-full bg-green-100 dark:bg-green-950/40">
        <Inbox className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Tutto tranquillo</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Non ci sono prenotazioni in attesa di approvazione in questo momento.
        </p>
      </div>
    </div>
  );
}

// ─── ReservationCard ──────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: view_reservations;
  onAction: (status: ReservationStatus) => void;
}

/**
 * Card della singola prenotazione in arrivo.
 * Mostra: avatar con iniziali, nome/nickname, campo, data, orario, tipo squadre,
 * note e i tre pulsanti azione (Chiama, Rifiuta, Conferma).
 */
function ReservationCard({ reservation, onAction }: ReservationCardProps) {
  const initials =
    `${reservation.name?.charAt(0) ?? ""}${reservation.surname?.charAt(0) ?? ""}`.toUpperCase() ||
    "?";

  const dateLabel = new Date(reservation.date).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const startLabel = new Date(reservation.start_time)
    .toISOString()
    .split("T")[1]
    .substring(0, 5);
  const endLabel = new Date(reservation.end_time)
    .toISOString()
    .split("T")[1]
    .substring(0, 5);

  return (
    <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200 gap-0 py-0">
      {/* ── Header: avatar + identità + badge campo ───────────────────── */}
      <CardHeader className="px-5 pt-4 pb-0 flex flex-row items-center gap-3 space-y-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary select-none">
            {initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">
            {reservation.name} {reservation.surname}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            @{reservation.nickname}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {reservation.description ?? "—"}
        </Badge>
      </CardHeader>

      {/* ── Content: dettagli + note ───────────────────────────────────── */}
      <CardContent className="px-5 py-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <span className="capitalize truncate">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <span className="font-mono">
              {startLabel} – {endLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Users2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <span>
              {reservation.mixed ? "Squadre miste" : "Squadre omogenee"}
            </span>
          </div>
        </div>

        {reservation.notes && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {reservation.notes}
            </p>
          </div>
        )}
      </CardContent>

      {/* ── Footer: azioni ────────────────────────────────────────────── */}
      <CardFooter className="px-5 pb-4 pt-2 gap-2 border-border/50">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs font-medium"
          onClick={() => {
            window.location.href = `tel:${reservation.telephone}`;
          }}
        >
          <Phone className="w-3.5 h-3.5" />
          Chiama
        </Button>
        <ReservationActionDialog
          type="rifiuta"
          reservation={reservation}
          onConfirm={() => onAction(ReservationStatus.REJECTED)}
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs font-medium text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50 hover:text-destructive"
          >
            <XCircle className="w-3.5 h-3.5" />
            Rifiuta
          </Button>
        </ReservationActionDialog>
        <ReservationActionDialog
          type="conferma"
          reservation={reservation}
          onConfirm={() => onAction(ReservationStatus.CONFIRMED)}
        >
          <Button
            type="button"
            size="sm"
            className="flex-[2] gap-1.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Conferma
          </Button>
        </ReservationActionDialog>
      </CardFooter>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrenotazioniAdminPage() {
  const [reservations, setReservations] = useState<view_reservations[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Contatore usato per triggerare il re-fetch dopo un'azione admin.
   * Incrementato da `onReservationAction` dopo ogni PUT riuscita.
   */
  const [reload, setReload] = useState<number>(0);

  // ── Fetch prenotazioni in arrivo ───────────────────────────────────────────
  useEffect(() => {
    setLoading(true);

    fetch("/api/reservations/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(INCOMING_FILTER),
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
  }, [reload]);

  /**
   * Aggiorna lo stato di una prenotazione sul backend.
   * Dopo il successo incrementa `reload` per triggerare il re-fetch,
   * togliendo automaticamente la card dalla lista.
   */
  function onReservationAction(
    reservationId: number,
    status: ReservationStatus,
  ) {
    fetch(`/api/reservations/${reservationId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status.valueOf() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success("Prenotazione aggiornata con successo");
        setReload((prev) => prev + 1);
      })
      .catch(() =>
        toast.error("Errore durante l'aggiornamento della prenotazione"),
      );
  }

  return (
    <div className="w-full h-full flex flex-col gap-5 overflow-y-auto overflow-x-hidden pb-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Prenotazioni in arrivo
        </h1>
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Caricamento in corso..."
            : reservations.length === 0
              ? "Nessuna prenotazione in attesa"
              : `${reservations.length} prenotazion${reservations.length === 1 ? "e" : "i"} da gestire`}
        </p>
      </div>

      {/* ── Griglia ─────────────────────────────────────────────────────── */}
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
          /* Lista prenotazioni in arrivo */
          reservations.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onAction={(status) => onReservationAction(r.id, status)}
            />
          ))
        )}
      </div>
    </div>
  );
}
