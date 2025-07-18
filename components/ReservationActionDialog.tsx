import React from "react";
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
import { view_reservations } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Award, Calendar, Clock10Icon, User } from "lucide-react";

export default function ReservationActionDialog({
  type,
  children,
  reservation,
  onConfirm,
}: {
  type: "conferma" | "rifiuta";
  children: React.ReactNode;
  reservation: view_reservations;
  onConfirm?: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {type === "conferma"
              ? "Conferma Prenotazione"
              : "Rifiuta Prenotazione"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {type === "conferma"
              ? "Sei sicuro di voler confermare questa prenotazione? La prenotazione sarà visibile nella tua lista di prenotazioni."
              : "Sei sicuro di voler rifiutare questa prenotazione? La prenotazione non sarà più visibile nella tua lista di prenotazioni."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid mb-3 grid-cols-2 gap-2 place-items-center lg:place-items-start">
          <span className="flex items-center gap-2">
            <User size={16} /> {reservation.name} {reservation.surname}
          </span>

          <span className="flex items-center gap-2">
            <Award size={16} />
            {reservation.description}
          </span>

          <span className="flex items-center gap-2">
            <Calendar size={16} />
            {new Date(reservation.date).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>

          <span className="flex gap-2 items-center">
            <Clock10Icon size={16} />
            {new Date(reservation.start_time).toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            }) +
              " - " +
              new Date(reservation.end_time).toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={type === "rifiuta" ? "bg-destructive" : ""}
          >
            {type === "conferma" ? "Conferma" : "Rifiuta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
