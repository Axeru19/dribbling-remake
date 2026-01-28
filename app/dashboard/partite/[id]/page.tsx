"use client";

import DeleteReservationButton from "@/components/deletereservation-button";
import ReservationDetailForm from "@/components/ReservationDetailForm";
import ReservationPaymentsTable from "@/components/ReservationPaymentsTable";
import ReservationUserSelection from "@/components/ReservationUserSelection";
import { Button } from "@/components/ui/button";
import { useFields } from "@/context/FieldsContex";
import { ReservationStatus } from "@/lib/enums";
import { fields, reservations, users, users_wallets } from "@prisma/client";
import { Trash2, TrashIcon } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<reservations | null>(null);
  const [reservationUser, setReservationUser] = useState<users_wallets | null>(
    null,
  );
  const fields: fields[] = useFields();

  useEffect(() => {
    if (id == "new") return;

    fetch("/api/reservations/" + id, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setReservation(data);
        setReservationUser(data.users);
      })
      .catch(() => {
        toast.error("Errore durante il caricamento della prenotazione.");
      });
  }, []);

  function deleteReservation() {
    if (!reservation) return;

    fetch(`/api/reservations/${reservation.id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status: ReservationStatus.DELETED, // deleted status
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        toast.success("Prenotazione eliminata con successo.");
        window.location.href = "/dashboard/partite";
      })
      .catch(() => {
        toast.error("Errore durante l'eliminazione della prenotazione.");
      });
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
      <header>
        <h1 className="text-2xl font-bold flex items-center">
          Prenotazione {id == "new" ? "Nuova" : reservation?.id}
          {" - "}
          {
            fields.find((field) => field.id === reservation?.id_field)
              ?.description
          }
          {reservation && (
            <span className="ml-4">
              <DeleteReservationButton deleteReservation={deleteReservation} />
            </span>
          )}
        </h1>
        <h2 className="font-bold">
          {reservationUser?.name}{" "}
          {reservationUser?.surname == "" || reservationUser?.surname == null
            ? reservation?.user_not_registered
            : reservationUser?.surname}
          {reservationUser?.nickname && (
            <span className="text-gray-400 ml-3">
              @{reservationUser?.nickname}
            </span>
          )}
        </h2>
      </header>

      <div className="flex flex-col gap-10 md:gap-4 md:flex-row w-full h-full">
        {reservation && (
          <div className="min-h-full flex-1">
            <ReservationDetailForm reservation={reservation} />
          </div>
        )}

        {reservation && (
          <div className="min-h-full flex-1">
            <ReservationPaymentsTable reservation={reservation || undefined} />
          </div>
        )}

        {!reservation && (
          <div className="min-h-full flex-1">
            <ReservationUserSelection
              user={reservationUser}
              setUser={setReservationUser}
            />
          </div>
        )}
      </div>
    </div>
  );
}
