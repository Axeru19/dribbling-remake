"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { view_reservations } from "@prisma/client";
import { CheckCircle2, XCircle, Calendar, Clock } from "lucide-react";

interface ReservationActionDialogProps {
  type: "conferma" | "rifiuta";
  children: React.ReactNode;
  reservation: view_reservations;
  onConfirm?: () => void;
}

export default function ReservationActionDialog({
  type,
  children,
  reservation,
  onConfirm,
}: ReservationActionDialogProps) {
  const isConfirm = type === "conferma";
  const Icon = isConfirm ? CheckCircle2 : XCircle;

  const shortDate = new Date(reservation.date).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent>
        {/* Header */}
        <div className="px-5 pt-5 pb-6">
          <div
            className={[
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
              isConfirm ? "bg-green-500/10" : "bg-destructive/10",
            ].join(" ")}
          >
            <Icon
              className={[
                "w-7 h-7",
                isConfirm ? "text-green-600" : "text-destructive",
              ].join(" ")}
            />
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            {isConfirm
              ? "Confermare la prenotazione?"
              : "Rifiutare la prenotazione?"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            {isConfirm
              ? "Stai per confermare questa prenotazione. L'utente verrà notificato."
              : "Stai per rifiutare questa prenotazione. L'azione non può essere annullata."}
          </p>
        </div>

        {/* Fact grid */}
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-border/50 bg-accent/30 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-border/50">
              <FactCell
                icon={Calendar}
                label="Giorno"
                value={shortDate}
              />
              <FactCell
                icon={Clock}
                label="Orario"
                value={`${startLabel}–${endLabel}`}
              />
            </div>
            <div className="border-t border-border/50 px-4 py-3.5">
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest leading-none mb-1">
                Cliente
              </p>
              <p className="text-sm font-bold text-foreground">
                {`${reservation.name ?? ""} ${reservation.surname ?? ""}`.trim()}
              </p>
              {reservation.nickname && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  @{reservation.nickname}
                </p>
              )}
            </div>
            {reservation.description && (
              <div className="border-t border-border/50 px-4 py-3.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest leading-none mb-1">
                  Campo
                </p>
                <p className="text-sm font-bold text-foreground">
                  {reservation.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DrawerFooter className="px-5 pt-0 pb-8 gap-2">
          <DrawerClose asChild>
            <Button
              size="lg"
              className={[
                "w-full h-12 gap-2 font-semibold active:scale-[0.98] transition-transform",
                isConfirm ? "" : "bg-destructive hover:bg-destructive/90",
              ].join(" ")}
              onClick={onConfirm}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isConfirm ? "Sì, conferma" : "Sì, rifiuta"}
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="w-full h-10 text-muted-foreground"
            >
              Annulla
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function FactCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest leading-none">
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-foreground leading-snug break-words">
        {value}
      </p>
    </div>
  );
}
