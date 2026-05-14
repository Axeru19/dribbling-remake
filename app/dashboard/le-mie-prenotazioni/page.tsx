"use client";

import DeleteReservationButton from "@/components/deletereservation-button";
import { Button } from "@/components/ui/button";
import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import { AppUser } from "@/types/types";
import { view_reservations } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import { Clock, CreditCard, FileText, Inbox, Users2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface StatusMeta {
  label: string;
  color: string;
}

const STATUS_META: Record<ReservationStatus, StatusMeta> = {
  [ReservationStatus.INCOMING]: {
    label: "In arrivo",
    color: ReservationStatusColor.INCOMING,
  },
  [ReservationStatus.CONFIRMED]: {
    label: "Confermata",
    color: ReservationStatusColor.CONFIRMED,
  },
  [ReservationStatus.REJECTED]: {
    label: "Rifiutata",
    color: ReservationStatusColor.REJECTED,
  },
  [ReservationStatus.DELETED]: {
    label: "Eliminata",
    color: ReservationStatusColor.DELETED,
  },
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-[68px] h-[68px] rounded-2xl bg-accent shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-32 rounded-md bg-accent" />
          <div className="h-4 w-16 rounded-full bg-accent" />
        </div>
        <div className="h-3 w-48 rounded-md bg-accent" />
      </div>
      <div className="h-8 w-16 rounded-lg bg-accent shrink-0" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold">Nessuna prenotazione</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Non hai ancora prenotato nessun campo. Vai su{" "}
          <span className="text-primary font-medium">Nuova Prenotazione</span>{" "}
          per iniziare.
        </p>
      </div>
    </div>
  );
}

interface ReservationRowProps {
  reservation: view_reservations;
  onDelete: (id: number) => void;
}

function ReservationRow({ reservation, onDelete }: ReservationRowProps) {
  const status = reservation.id_status as ReservationStatus;
  const meta = STATUS_META[status] ?? STATUS_META[ReservationStatus.INCOMING];

  const startLabel = new Date(reservation.start_time)
    .toISOString()
    .split("T")[1]
    .substring(0, 5);
  const endLabel = new Date(reservation.end_time)
    .toISOString()
    .split("T")[1]
    .substring(0, 5);

  const canDelete =
    status !== ReservationStatus.DELETED &&
    status !== ReservationStatus.REJECTED;
  const canPay = status === ReservationStatus.CONFIRMED;
  const isInactive =
    status === ReservationStatus.DELETED ||
    status === ReservationStatus.REJECTED;

  return (
    <div
      className={`flex items-center gap-4 py-4 transition-colors hover:bg-accent/30 ${
        isInactive ? "opacity-50" : ""
      }`}
    >
      {/* Date block — colore tinto dallo stato */}
      <div
        className="w-[68px] h-[68px] rounded-2xl flex flex-col items-center justify-center shrink-0 select-none"
        style={{ backgroundColor: `${meta.color}1a` }}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5"
          style={{ color: meta.color }}
        >
          {format(new Date(reservation.date), "EEE", { locale: it })}
        </span>
        <span
          className="text-3xl font-black leading-none"
          style={{ color: meta.color }}
        >
          {format(new Date(reservation.date), "d")}
        </span>
        <span
          className="text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5"
          style={{ color: meta.color }}
        >
          {format(new Date(reservation.date), "MMM", { locale: it })}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm">
            {reservation.description ?? "—"}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground/60">
            #{reservation.id}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${meta.color}22`,
              color: meta.color,
            }}
          >
            {meta.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="font-mono">
              {startLabel} – {endLabel}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Users2 className="w-3 h-3 shrink-0" />
            {reservation.mixed ? "Squadre miste" : "Omogenee"}
          </span>
        </div>

        {reservation.notes && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground/60">
            <FileText className="w-3 h-3 shrink-0" />
            <span className="truncate">{reservation.notes}</span>
          </div>
        )}
      </div>

      {/* Azioni */}
      <div className="flex items-center gap-2 shrink-0">
        {canPay && (
          <Button size="sm" disabled className="gap-1.5 text-xs h-8 px-3">
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paga</span>
          </Button>
        )}
        {canDelete && (
          <DeleteReservationButton
            deleteReservation={() => onDelete(reservation.id)}
          />
        )}
      </div>
    </div>
  );
}

export default function LeMiePrenotazioniPage() {
  const user = useSession().data?.user as AppUser | undefined;
  const [reservations, setReservations] = useState<view_reservations[]>([]);
  const [loading, setLoading] = useState(true);

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

  const countLabel = loading
    ? "Caricamento..."
    : reservations.length === 0
      ? "Nessuna prenotazione trovata"
      : `${reservations.length} prenotazion${reservations.length === 1 ? "e" : "i"}`;

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">
          Le mie prenotazioni
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{countLabel}</p>
      </div>

      {/* Lista prenotazioni — unica zona scrollabile */}
      <div className="flex-1 min-h-0 rounded-2xl bg-card overflow-y-auto">
        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y">
            {reservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
