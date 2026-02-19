"use client";

/**
 * ReservationDetailForm
 *
 * Form per la visualizzazione e modifica dei dettagli di una prenotazione.
 * Quando `reservation` è null, il form è disabilitato (sola visualizzazione placeholder).
 * La logica di validazione, submit e API call è invariata rispetto all'originale.
 */

import { fields, reservations } from "@prisma/client";
import React from "react";
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
import { toLocalTimeDate } from "@/utils/localedate";
import {
  CalendarDays,
  Clock,
  Clock3,
  MapPin,
  DoorOpen,
  Users2,
  StickyNote,
  Save,
} from "lucide-react";

// ─── Schema di validazione ─────────────────────────────────────────────────
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
      return toMinutes(data.end_time) > toMinutes(data.start_time);
    },
    {
      message: "L'orario di fine deve essere dopo l'orario di inizio",
      path: ["end_time"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────
interface ReservationDetailFormProps {
  reservation: reservations | null;
}

// ─── Componente ────────────────────────────────────────────────────────────
export default function ReservationDetailForm({
  reservation,
}: ReservationDetailFormProps) {
  const availableFields: fields[] = useFields();

  /** Default values differenziati tra nuova e prenotazione esistente */
  const defaultValues: Partial<FormValues> = reservation
    ? {
        start_time: String(reservation.start_time).split("T")[1].slice(0, 5),
        end_time: String(reservation.end_time).split("T")[1].slice(0, 5),
        date: String(reservation.date).split("T")[0],
        id_field: reservation.id_field!,
        mixed: reservation.mixed || false,
        room: reservation.room || "",
        notes: reservation.notes || "",
      }
    : {
        start_time: "",
        end_time: "",
        date: "",
        id_field: undefined,
        mixed: false,
        room: "",
        notes: "",
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues,
  });

  /** Aggiorna la prenotazione via API — logica invariata */
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
      headers: { "Content-Type": "application/json" },
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
    <div className="w-full h-full rounded-xl border border-border bg-card shadow-sm">
      {/* Header card */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
          <CalendarDays className="size-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Dettagli partita
          </h3>
          <p className="text-xs text-muted-foreground">
            Modifica i dati della prenotazione
          </p>
        </div>
      </div>

      {/* Form body */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(updateReservation)}
          className="flex flex-col gap-6 p-6"
        >
          {/* ── Sezione: Data & Orari ─────────────────────────── */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Quando
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Data */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      Data
                    </FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orario inizio */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <Clock className="size-3.5 text-muted-foreground" />
                      Inizio
                    </FormLabel>
                    <Input type="time" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orario fine */}
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <Clock3 className="size-3.5 text-muted-foreground" />
                      Fine
                    </FormLabel>
                    <Input type="time" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* ── Sezione: Luogo & Configurazione ─────────────────── */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Configurazione
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Campo */}
              <FormField
                control={form.control}
                name="id_field"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      Campo
                    </FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleziona un campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Spogliatoio */}
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-sm">
                      <DoorOpen className="size-3.5 text-muted-foreground" />
                      Spogliatoio
                    </FormLabel>
                    <Input type="text" placeholder="Es. A1" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Squadre miste — row separata per enfasi */}
            <FormField
              control={form.control}
              name="mixed"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Users2 className="size-4 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-sm font-medium leading-none">
                          Squadre miste
                        </FormLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Abilita la modalità con squadre di genere misto
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      onBlur={field.onBlur}
                    />
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* ── Sezione: Note ─────────────────────────────────── */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Note
            </p>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-sm">
                    <StickyNote className="size-3.5 text-muted-foreground" />
                    Note aggiuntive
                  </FormLabel>
                  <Textarea
                    className="min-h-[100px] resize-none"
                    placeholder="Aggiungi note o istruzioni speciali..."
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── CTA ───────────────────────────────────────────── */}
          <Button
            type="submit"
            disabled={!reservation}
            className="w-full gap-2"
          >
            <Save className="size-4" />
            Salva modifiche
          </Button>
        </form>
      </Form>
    </div>
  );
}
