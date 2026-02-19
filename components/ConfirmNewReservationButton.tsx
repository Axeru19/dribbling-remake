"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  Layers,
  Users2,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { reservations, fields } from "@prisma/client";
import { useFields } from "@/context/FieldsContex";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { normalizeIds } from "@/utils/normalizeIds";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmNewReservationButtonProps {
  /**
   * La prenotazione costruita dal form. Sarà null se il form non è
   * ancora completo (campo, data o orario mancanti): in quel caso
   * il pulsante mostra lo stato delle selezioni mancanti.
   */
  reservation: Omit<reservations, "id"> | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConfirmNewReservationButton({
  reservation,
}: ConfirmNewReservationButtonProps) {
  const allFields = useFields() as fields[];
  const router = useRouter();
  const [sending, setSending] = useState(false);

  /** Invia la prenotazione al backend. */
  function sendReservation() {
    if (!reservation) return;

    setSending(true);

    // Normalizza i timestamp in UTC locale prima di serializzare
    const payload = {
      ...reservation,
      date: new Date(
        reservation.date!.getTime() -
          reservation.date!.getTimezoneOffset() * 60000,
      ),
      start_time: new Date(
        reservation.start_time!.getTime() -
          reservation.start_time!.getTimezoneOffset() * 60000,
      ),
      end_time: new Date(
        reservation.end_time!.getTime() -
          reservation.end_time!.getTimezoneOffset() * 60000,
      ),
    };

    fetch("/api/reservations/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizeIds(payload)),
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Errore durante l'invio della prenotazione");
        return res.json();
      })
      .then(() => {
        toast.success("Prenotazione inviata con successo!");
        router.push("/dashboard/le-mie-prenotazioni");
      })
      .catch((err: Error) => {
        toast.error(
          err.message || "Errore durante la creazione della prenotazione",
        );
      })
      .finally(() => setSending(false));
  }

  // Dati da mostrare nel dialog di riepilogo
  const fieldName =
    allFields.find((f) => f.id === reservation?.id_field)?.description ?? "—";
  const dateLabel =
    reservation?.date?.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }) ?? "—";
  const startLabel =
    reservation?.start_time?.toTimeString().substring(0, 5) ?? "—";
  const endLabel = reservation?.end_time?.toTimeString().substring(0, 5) ?? "—";

  // Il pulsante è disabilitato finché il form non è completo
  const isDisabled = reservation === null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isDisabled}
          className={[
            "w-full gap-2 h-10 px-6 font-semibold transition-all duration-200",
            isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "shadow-md hover:shadow-lg active:scale-[0.98]",
          ].join(" ")}
        >
          <CalendarCheck className="w-4 h-4 shrink-0" />
          Conferma prenotazione
        </Button>
      </AlertDialogTrigger>

      {/* Dialog di riepilogo — visibile solo se il form è completo */}
      {reservation && (
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <CalendarCheck className="w-5 h-5 text-primary" />
              Confermi la prenotazione?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              {/* Riepilogo visivo coerente con il design della pagina */}
              <div className="flex flex-col gap-4 pt-1">
                <p className="text-sm text-muted-foreground">
                  Controlla i dati prima di confermare. Potrai annullare entro
                  2h dall&apos;appuntamento.
                </p>

                <div className="rounded-xl border bg-accent/30 p-4 flex flex-col gap-3">
                  {/* Campo */}
                  <SummaryRow icon={Layers} label="Campo" value={fieldName} />

                  {/* Data */}
                  <SummaryRow
                    icon={CalendarDays}
                    label="Giorno"
                    value={dateLabel}
                  />

                  {/* Orario */}
                  <SummaryRow
                    icon={Clock}
                    label="Orario"
                    value={`${startLabel} – ${endLabel}`}
                  />

                  {/* Squadre miste */}
                  <SummaryRow
                    icon={Users2}
                    label="Squadre miste"
                    value={
                      reservation.mixed ? (
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          Sì
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No
                        </span>
                      )
                    }
                  />

                  {/* Note (solo se presenti) */}
                  {reservation.notes && (
                    <SummaryRow
                      icon={FileText}
                      label="Note"
                      value={reservation.notes}
                    />
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={sending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              disabled={sending}
              onClick={sendReservation}
              className="gap-2"
            >
              {sending ? "Invio in corso..." : "Conferma"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────

interface SummaryRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

/**
 * Riga del riepilogo nel dialog di conferma.
 * Mostra un'icona, un'etichetta e il valore corrispondente.
 */
function SummaryRow({ icon: Icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground break-words">
          {value}
        </div>
      </div>
    </div>
  );
}
