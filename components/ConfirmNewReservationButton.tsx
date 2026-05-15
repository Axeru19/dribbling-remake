"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, ShieldCheck, Users2, FileText } from "lucide-react";
import { reservations, fields } from "@prisma/client";
import { useFields } from "@/context/FieldsContex";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { normalizeIds } from "@/utils/normalizeIds";

interface ConfirmNewReservationButtonProps {
  reservation: Omit<reservations, "id"> | null;
}

export default function ConfirmNewReservationButton({
  reservation,
}: ConfirmNewReservationButtonProps) {
  const allFields = useFields() as fields[];
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  function sendReservation() {
    if (!reservation) return;
    setSending(true);
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
        setOpen(false);
        router.push("/dashboard/le-mie-prenotazioni");
      })
      .catch((err: Error) => {
        toast.error(
          err.message || "Errore durante la creazione della prenotazione",
        );
      })
      .finally(() => setSending(false));
  }

  const fieldName =
    allFields.find((f) => f.id === reservation?.id_field)?.description ?? "—";
  const shortDate =
    reservation?.date?.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) ?? "—";
  const startLabel =
    reservation?.start_time?.toTimeString().substring(0, 5) ?? "—";
  const endLabel = reservation?.end_time?.toTimeString().substring(0, 5) ?? "—";

  const isDisabled = reservation === null;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
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
      </DrawerTrigger>

      {reservation && (
        <DrawerContent>
          {/* Header */}
          <div className="px-5 pt-5 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <CalendarCheck className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              Confermi la prenotazione?
            </h2>
            <p className="text-sm text-muted-foreground mt-1 leading-snug">
              Controlla i dettagli prima di procedere.
            </p>
          </div>

          {/* Key facts grid */}
          <div className="px-5 pb-5">
            <div className="rounded-2xl border border-border/50 bg-accent/30 overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border/50">
                <FactCell label="Campo" value={fieldName} />
                <FactCell label="Giorno" value={shortDate} />
                <FactCell label="Orario" value={`${startLabel}–${endLabel}`} />
              </div>
            </div>
          </div>

          {/* Secondary info */}
          <div className="px-5 pb-2">
            <div className="flex items-center justify-between py-3 border-t border-border/40">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Users2 className="w-3.5 h-3.5 shrink-0" />
                Squadre miste
              </span>
              <Badge
                variant={reservation.mixed ? "default" : "secondary"}
                className="text-xs"
              >
                {reservation.mixed ? "Sì" : "No"}
              </Badge>
            </div>

            {reservation.notes && (
              <div className="flex items-start gap-2 py-3 border-t border-border/40">
                <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">
                    Note
                  </p>
                  <p className="text-sm text-foreground break-words">
                    {reservation.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DrawerFooter className="px-5 pt-3 pb-8 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 justify-center pb-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Potrai annullare fino a 2h prima</span>
            </div>
            <Button
              size="lg"
              className="w-full h-12 gap-2 font-semibold shadow-md active:scale-[0.98] transition-transform"
              onClick={sendReservation}
              disabled={sending}
            >
              {sending ? (
                "Invio in corso..."
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4 shrink-0" />
                  Conferma prenotazione
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="w-full h-10 text-muted-foreground"
                disabled={sending}
              >
                Annulla
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      )}
    </Drawer>
  );
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-3.5">
      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest leading-none">
        {label}
      </p>
      <p className="text-sm font-bold text-foreground leading-snug break-words">
        {value}
      </p>
    </div>
  );
}
