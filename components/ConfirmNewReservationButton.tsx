"use client";

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
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { fields, reservations } from "@prisma/client";
import { useFields } from "@/context/FieldsContex";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { normalizeIds } from "@/utils/normalizeIds";
import { date } from "zod";

export default function ConfirmNewReservationButton({
  reservation,
}: {
  reservation: Omit<reservations, "id">;
}) {
  const fields = useFields() as fields[];
  const router = useRouter();

  function sendReservation() {
    if (!reservation) return;

    const reservationToSend = {
      ...reservation,
      // convert to local timezone
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizeIds(reservationToSend)),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Errore durante l'invio della prenotazione");
        }
        return res.json();
      })
      .then(() => {
        toast.success("Prenotazione inviata con successo!");
        // Optionally, you can add more logic here, like redirecting the user
        router.push("/dashboard/le-mie-prenotazioni");
      })
      .catch((err) => {
        toast.error(
          err.message || "Errore durante la creazione della prenotazione",
        );
      });
  }

  return (
    <div className="w-full md:w-fit ml-auto mt-auto">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full">Conferma Prenotazione</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confermi la prenotazione?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="flex flex-col gap-2">
                <span className="font-bold">Riepilogo</span>
                <span className="flex justify-center flex-wrap gap-8 gap-y-3">
                  <FormFiedlDescription
                    label="campo"
                    value={
                      fields.find((field) => field.id === reservation.id_field)
                        ?.description || ""
                    }
                  />
                  <FormFiedlDescription
                    label="Giorno"
                    value={`${reservation.date?.toLocaleDateString("it-IT")}`}
                  />
                  <FormFiedlDescription
                    label="ora inizio"
                    value={`${reservation.start_time?.toTimeString().substring(0, 5)}`}
                  />
                  <FormFiedlDescription
                    label="ora fine"
                    value={`${reservation.end_time?.toTimeString().substring(0, 5)}`}
                  />

                  <FormFiedlDescription
                    label="Squadre miste"
                    value={`${reservation.mixed ? "Sì" : "No"}`}
                  />

                  <FormFiedlDescription
                    label="note"
                    value={`${reservation.notes || "Nessuna"}`}
                  />
                </span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction className="bg-success" onClick={sendReservation}>
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormFiedlDescription({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="flex flex-1 flex-col">
      <span className="text-xs font-medium capitalize truncate">{label}</span>
      <span className="  max-w-full">{value}</span>
    </span>
  );
}
