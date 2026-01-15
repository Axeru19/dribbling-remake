"use client";

import { fields, reservations } from "@prisma/client";
import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, Form, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { useFields } from "@/context/FieldsContex";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";

const formSchema = z
  .object({
    start_time: z.string().min(1, "L'orario di inizio è obbligatorio"),
    date: z.string().min(1, "La data è obbligatoria"),
    end_time: z.string().min(1, "L'orario di fine è obbligatorio"),
    id_field: z.number().min(1, "Il campo è obbligatorio"),
    mixed: z.boolean().optional(),
    room: z.string().optional(),
    notes: z.string().optional(),
    id_user: z.number().optional(),
    user_not_registered: z.string().optional(),
  })
  .refine(
    (data) => {
      const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const start = toMinutes(data.start_time);
      const end = toMinutes(data.end_time);
      return end > start;
    },
    {
      message: "L'orario di fine deve essere dopo l'orario di inizio",
      path: ["end_time"],
    }
  );

export default function ReservationDetailForm({
  reservation,
}: {
  reservation: reservations | null;
}) {
  const fields: fields[] = useFields();

  function toLocalTimeDate(dateStr: string, timeStr: string) {
    const date = new Date(`${dateStr}T${timeStr}:00`);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }

  const form = reservation
    ? useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
          start_time: String(reservation?.start_time).split("T")[1].slice(0, 5),
          end_time: String(reservation?.end_time).split("T")[1].slice(0, 5),
          date: String(reservation?.date).split("T")[0],
          id_field: reservation?.id_field!,
          mixed: reservation?.mixed || false,
          room: reservation?.room || "",
          notes: reservation?.notes || "",
        },
      })
    : useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
          start_time: "",
          end_time: "",
          date: "",
          id_field: undefined,
          mixed: false,
          room: "",
          notes: "",
        },
      });

  function updateReservation() {
    const data = form.getValues();
    const newReservation: reservations = {
      id: reservation!.id,
      start_time: toLocalTimeDate(data.date, data.start_time),
      end_time: toLocalTimeDate(data.date, data.end_time),
      date: toLocalTimeDate(data.date, "00:00"),
      id_field: data.id_field ?? null,
      mixed: data.mixed ?? null,
      room: data.room ?? null,
      notes: data.notes ?? null,
      id_user: reservation!.id_user,
      id_status: reservation!.id_status,
      user_not_registered: reservation!.user_not_registered,
    };

    fetch("/api/reservations/" + reservation?.id, {
      method: "PUT",
      body: JSON.stringify({ reservation: newReservation }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        toast.success("Prenotazione aggiornata con successo.");
      })
      .catch(() => {
        toast.error("Errore durante l'aggiornamento della prenotazione.");
      });
  }

  return (
    <div className="w-full h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(updateReservation)}
          className="w-full flex flex-col gap-4 items-start justify-center h-full"
        >
          <div className=" flex-col md:flex-row flex gap-4 w-full">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Data</FormLabel>
                  <Input
                    type="date"
                    placeholder="Inserisci la data"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Orario di inizio</FormLabel>
                  <Input
                    type="time"
                    placeholder="Inserisci l'orario di inizio"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Orario di fine</FormLabel>
                  <Input
                    type="time"
                    placeholder="Inserisci l'orario di fine"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start w-full">
            <FormField
              control={form.control}
              name="mixed"
              render={({ field }) => (
                <FormItem className="flex-1 w-full flex flex-col justify-between items-center">
                  <FormLabel className="mb-2">Squadre miste</FormLabel>
                  <Switch
                    className="scale-150 my-auto"
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    onBlur={field.onBlur}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Spogliatoio</FormLabel>
                  <Input
                    type="text"
                    placeholder="Inserisci il numero dello spogliatoio"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_field"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Campo</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona un campo" />
                    </SelectTrigger>

                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={String(field.id)}>
                          {field.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full h-full">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="flex-1 h-full flex flex-col">
                  <FormLabel className="h-fit">Note</FormLabel>
                  <Textarea
                    className="h-full"
                    placeholder="Inserisci le note"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={!reservation} className="w-full">
            Salva modifiche
          </Button>
        </form>
      </Form>
    </div>
  );
}
