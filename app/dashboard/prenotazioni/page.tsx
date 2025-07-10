"use client";

import { Toaster } from "@/components/ui/sonner";
import { reservations, view_reservations } from "@prisma/client";
import { set } from "date-fns";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [reservations, setReservations] = useState<view_reservations[]>([]);

  useEffect(() => {
    fetch("/api/reservations/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Assuming data is an array of reservations
        setReservations(data);
      })
      .catch((error) => {
        toast.error("Errore durante il caricamento delle prenotazioni");
      });
  }, []);

  return <div>page</div>;
}

function ReservationIncoming({
  reservation,
}: {
  reservation: view_reservations;
}) {
  return;
}
