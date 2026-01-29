"use client";

import ConfirmNewReservationButton from "@/components/ConfirmNewReservationButton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFields } from "@/context/FieldsContex";
import { Timeslots } from "@/lib/constants";
import { ReservationStatus } from "@/lib/enums";
import { fields, reservations } from "@prisma/client";
import { set } from "date-fns";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, use } from "react";
import { toast } from "sonner";

export default function NuovaPrenotazione() {
  const fields = useFields().filter((f) => f.status) as fields[];
  const { data: session, status } = useSession();
  const [slotsAvailable, setSlotsAvailable] = useState<string[]>([]);

  const [newReservation, setNewReservation] = useState<
    Omit<reservations, "id">
  >({
    id_field: 1,
    id_user: BigInt(0),
    date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
    id_status: ReservationStatus.INCOMING,
    room: "",
    notes: "",
    mixed: false,
    user_not_registered: null,
  });

  // set the user id when session is available
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setNewReservation((prev) => ({
        ...prev,
        // Assicurati che l'ID sia convertibile in BigInt
        id_user: BigInt(session.user.id),
      }));
    }
  }, [session, status]);

  // fetch available slots when date or field changes
  useEffect(() => {
    fetch("/api/slot/available", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: newReservation.date,
        id_field: newReservation.id_field,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Errore nel recupero degli orari disponibili");
        }
        return res.json();
      })
      .then((data) => {
        setSlotsAvailable(data);
      })
      .catch((error) => {
        toast.error("Errore nel recupero degli orari disponibili");
      });
  }, [newReservation.date, newReservation.id_field]);

  return (
    <div className="w-full h-full flex-col flex gap-4 overflow-y-auto">
      <div className="w-full flex flex-col gap-4">
        <h1 className="font-bold w-full text-2xl">Seleziona un campo</h1>
        <div className="flex w-full gap-4">
          {fields
            .filter((field) => field.status)
            .sort((a, b) => a.id - b.id)
            .map((field) => (
              <div key={field.id} className="flex-1">
                <div
                  className="rounded-lg p-2 text-center flex items-center justify-center cursor-pointer bg-accent h-full"
                  style={{
                    border:
                      newReservation.id_field == field.id
                        ? "2px solid #888888"
                        : "",
                  }}
                  onClick={() => {
                    setNewReservation({
                      ...newReservation,
                      id_field: field.id,
                    });
                  }}
                >
                  <p className="font-semibold">{field.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Display date from today to 3 weeeks  */}
        <div className=" flex flex-1 flex-col gap-4 ">
          <h1 className="font-bold flex w-full text-2xl">
            Seleziona il giorno
          </h1>
          <div className="flex flex-1 justify-center md:justify-start flex-wrap gap-2">
            {Array.from({ length: 21 }).map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              const isSelected =
                newReservation.date!.toDateString() === date.toDateString();
              return (
                <div
                  key={index}
                  className="h-fit flex-1 md:flex-initial"
                  style={{ minWidth: "100px" }}
                >
                  <div
                    className="rounded-lg p-2 text-center cursor-pointer bg-accent h-full"
                    style={{
                      border: isSelected ? "2px solid #888888" : "",
                    }}
                    onClick={() => {
                      setNewReservation({
                        ...newReservation,
                        date: date,
                      });
                    }}
                  >
                    <p className=" text-xs md:text-sm">
                      {date.toLocaleDateString("it-IT", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className=" flex flex-1 flex-col gap-4 ">
          <h1 className="font-bold text-2xl w-full">
            Seleziona l'orario disponibile
          </h1>

          <div className="flex flex-wrap w-full justify-center md:justify-start gap-2">
            {slotsAvailable.length > 0 &&
              slotsAvailable.map((slot, index) => {
                const isSelected =
                  newReservation.start_time!.toTimeString().substring(0, 5) ===
                  slot;
                return (
                  <div
                    key={index}
                    className="h-fit flex-1 md:flex-initial"
                    style={{ minWidth: "80px" }}
                  >
                    <div
                      className="rounded-lg p-2 text-center cursor-pointer bg-accent h-full"
                      style={{
                        border: isSelected ? "2px solid #888888" : "",
                      }}
                      onClick={() => {
                        const [hours, minutes] = slot.split(":").map(Number);
                        let startTime = new Date();
                        startTime.setHours(hours, minutes, 0, 0);
                        const endTime = new Date(startTime);
                        endTime.setHours(endTime.getHours() + 1);
                        setNewReservation({
                          ...newReservation,
                          start_time: startTime,
                          end_time: endTime,
                        });
                      }}
                    >
                      <p className=" text-xs md:text-sm">{slot}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-col md:flex-row justify-center md:justify-start w-full items-center">
        <div className="flex-1 flex justify-center items-center">
          <span className="flex items-center gap-4">
            Squadre miste{" "}
            <Switch
              className="scale-120 my-auto"
              checked={Boolean(newReservation.mixed)}
              onCheckedChange={(checked) =>
                setNewReservation({
                  ...newReservation,
                  mixed: checked,
                })
              }
            />
          </span>
        </div>

        <Textarea
          className="flex-1"
          placeholder="Inserisci le note"
          value={newReservation.notes!}
          onChange={(e) =>
            setNewReservation({
              ...newReservation,
              notes: e.target.value,
            })
          }
        />
      </div>

      <ConfirmNewReservationButton reservation={newReservation} />
    </div>
  );
}
