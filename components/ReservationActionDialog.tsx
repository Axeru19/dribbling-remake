"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { view_reservations } from "@prisma/client";
import {
  User,
  Layers,
  Calendar,
  Clock,
  Users2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReservationActionDialogProps {
  /** "conferma" = voglio approvare la prenotazione; "rifiuta" = la rifiuto */
  type: "conferma" | "rifiuta";
  children: React.ReactNode;
  reservation: view_reservations;
  onConfirm?: () => void;
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────

interface SummaryRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

/**
 * Riga del riepilogo nel dialog di conferma/rifiuto.
 * Coerente col design del resto dell'app.
 */
function SummaryRow({ icon: Icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-md bg-accent text-muted-foreground shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog di conferma per le azioni admin su una prenotazione.
 * Mostra un riepilogo visivo della prenotazione e permette di confermare
 * o annullare l'azione (conferma/rifiuto).
 *
 * Props invariate rispetto alla versione originale per compatibilità
 * con tutti i punti di utilizzo esistenti.
 */
export default function ReservationActionDialog({
  type,
  children,
  reservation,
  onConfirm,
}: ReservationActionDialogProps) {
  const isConfirm = type === "conferma";

  // Dati formattati per il riepilogo
  const dateLabel = new Date(reservation.date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startLabel = new Date(reservation.start_time).toLocaleTimeString(
    "it-IT",
    { hour: "2-digit", minute: "2-digit" },
  );
  const endLabel = new Date(reservation.end_time).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-sm sm:max-w-md">
        <AlertDialogHeader>
          {/* Icona + titolo colorati in base all'azione */}
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isConfirm
                  ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              }`}
            >
              {isConfirm ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <AlertDialogTitle className="text-base">
              {isConfirm ? "Conferma prenotazione" : "Rifiuta prenotazione"}
            </AlertDialogTitle>
          </div>

          {/* Messaggio contestuale */}
          <p className="text-sm text-muted-foreground">
            {isConfirm
              ? "Stai per confermare questa prenotazione. L'utente verrà notificato."
              : "Stai per rifiutare questa prenotazione. L'azione non può essere annullata."}
          </p>
        </AlertDialogHeader>

        {/* ── Riepilogo prenotazione ─────────────────────────────────── */}
        <div className="rounded-xl border bg-accent/20 p-4 flex flex-col gap-3 my-1">
          <SummaryRow
            icon={User}
            label="Cliente"
            value={`${reservation.name ?? ""} ${reservation.surname ?? ""} (@${reservation.nickname ?? ""})`}
          />

          <SummaryRow
            icon={Layers}
            label="Campo"
            value={reservation.description ?? "—"}
          />

          <SummaryRow icon={Calendar} label="Data" value={dateLabel} />

          <SummaryRow
            icon={Clock}
            label="Orario"
            value={`${startLabel} – ${endLabel}`}
          />

          <SummaryRow
            icon={Users2}
            label="Formato"
            value={reservation.mixed ? "Squadre miste" : "Squadre omogenee"}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isConfirm ? "" : "bg-destructive hover:bg-destructive/90"
            }
          >
            {isConfirm ? "Sì, conferma" : "Sì, rifiuta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
