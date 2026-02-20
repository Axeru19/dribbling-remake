"use client";

import ConfirmNewReservationButton from "@/components/ConfirmNewReservationButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFields } from "@/context/FieldsContex";
import { ReservationStatus } from "@/lib/enums";
import { fields, reservations } from "@prisma/client";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Stato della bozza di prenotazione durante la compilazione del form.
 * I campi obbligatori (campo, data, orario) sono null finché l'utente
 * non li seleziona esplicitamente, evitando selezioni pre-impostate fuorvianti.
 */
type ReservationDraft = {
  /** ID del campo sportivo selezionato, null se non ancora scelto */
  id_field: number | null;
  /** ID dell'utente dalla sessione */
  id_user: bigint;
  /** Data di gioco selezionata, null se non ancora scelta */
  date: Date | null;
  /** Orario di inizio, null se non ancora scelto */
  start_time: Date | null;
  /** Orario di fine (start_time + 1h), null se non ancora scelto */
  end_time: Date | null;
  /** Note facoltative dell'utente */
  notes: string;
  /** Se le squadre sono miste */
  mixed: boolean;
};

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Campo", icon: Layers },
  { id: 2, label: "Data", icon: CalendarDays },
  { id: 3, label: "Orario", icon: Clock },
  { id: 4, label: "Dettagli", icon: FileText },
] as const;

// ─── Helpers per la derivazione dello step corrente ──────────────────────────

/**
 * Restituisce lo step attivo (1–4) in base alle selezioni dell'utente.
 * Lo step avanza solo quando il campo precedente è stato completato.
 */
function deriveCurrentStep(draft: ReservationDraft): 1 | 2 | 3 | 4 {
  if (!draft.id_field) return 1;
  if (!draft.date) return 2;
  if (!draft.start_time) return 3;
  return 4;
}

// ─── StepIndicator ───────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: number;
}

/**
 * Mostra il progresso del form.
 * Su mobile (<sm): versione compatta con barre pill + testo "Passo X di Y".
 * Su sm+: stepper orizzontale completo con icone e connettori.
 */
function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentStepData = STEPS.find((s) => s.id === currentStep);

  return (
    <>
      {/* ── Mobile: pill bar compatta ── */}
      <div className="flex sm:hidden items-center gap-3 py-1">
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.id < currentStep
                  ? "w-6 bg-primary"
                  : s.id === currentStep
                    ? "w-8 bg-primary"
                    : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {currentStepData?.label}
          </span>{" "}
          · Passo {currentStep} di {STEPS.length}
        </span>
      </div>

      {/* ── Desktop: stepper orizzontale ── */}
      <div className="hidden sm:flex items-center justify-center gap-0 w-full">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={[
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    done
                      ? "bg-primary border-primary text-primary-foreground"
                      : "",
                    active
                      ? "bg-primary border-primary text-primary-foreground shadow-lg ring-4 ring-primary/20"
                      : "",
                    !done && !active
                      ? "bg-background border-border text-muted-foreground"
                      : "",
                  ].join(" ")}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors whitespace-nowrap ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 mb-5 rounded-full transition-all duration-300 ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

// ─── SectionHeader ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}

function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h2 className="font-semibold text-base leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NuovaPrenotazione() {
  const activeFields = useFields().filter((f) => f.status) as fields[];
  const { data: session, status: sessionStatus } = useSession();

  const [slotsAvailable, setSlotsAvailable] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Stato iniziale completamente vuoto: nessuna selezione pre-impostata
  const [draft, setDraft] = useState<ReservationDraft>({
    id_field: null,
    id_user: BigInt(0),
    date: null,
    start_time: null,
    end_time: null,
    notes: "",
    mixed: false,
  });

  // Derivazione dello step attivo dalla selezione corrente
  const currentStep = deriveCurrentStep(draft);

  // Campi derivati per comodità nei template
  const selectedField =
    activeFields.find((f) => f.id === draft.id_field) ?? null;
  const selectedTimeLabel = draft.start_time
    ? draft.start_time.toTimeString().substring(0, 5)
    : null;

  // ── Effetto: aggiorna l'ID utente quando la sessione è disponibile ──────────
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      setDraft((prev) => ({ ...prev, id_user: BigInt(session.user.id) }));
    }
  }, [session, sessionStatus]);

  // ── Effetto: recupera gli slot disponibili solo se campo e data sono scelti ─
  useEffect(() => {
    // Non fare nulla finché l'utente non ha selezionato entrambi
    if (!draft.id_field || !draft.date) return;

    setLoadingSlots(true);
    setSlotsAvailable([]); // Pulisce gli slot precedenti mentre carica

    fetch("/api/slot/available", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: draft.date, id_field: draft.id_field }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json() as Promise<string[]>;
      })
      .then(setSlotsAvailable)
      .catch(() => toast.error("Errore nel recupero degli orari disponibili"))
      .finally(() => setLoadingSlots(false));
  }, [draft.date, draft.id_field]);

  /**
   * Converte il draft in un oggetto `reservations` compatibile con il backend.
   * Restituisce null se i campi obbligatori non sono ancora valorizzati.
   */
  function buildReservation(): Omit<reservations, "id"> | null {
    if (
      !draft.id_field ||
      !draft.date ||
      !draft.start_time ||
      !draft.end_time
    ) {
      return null;
    }
    return {
      id_field: draft.id_field,
      id_user: draft.id_user,
      date: draft.date,
      start_time: draft.start_time,
      end_time: draft.end_time,
      id_status: ReservationStatus.INCOMING,
      room: "",
      notes: draft.notes,
      mixed: draft.mixed,
      user_not_registered: null,
    };
  }

  const builtReservation = buildReservation();

  return (
    <TooltipProvider>
      <div className="w-full h-full flex flex-col gap-5 overflow-y-auto overflow-x-hidden pb-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Nuova Prenotazione
          </h1>
          <p className="text-sm text-muted-foreground">
            Prenota la tua prossima partita.
          </p>
        </div>

        {/* ── Step Indicator ──────────────────────────────────────────────── */}
        <StepIndicator currentStep={currentStep} />

        {/* ── Summary Bar: mostra solo le selezioni già effettuate ─────────── */}
        {(selectedField || draft.date || selectedTimeLabel) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium shrink-0">
              Selezione:
            </span>
            {selectedField && (
              <Badge variant="secondary" className="gap-1.5 max-w-full">
                <Layers className="w-3 h-3 shrink-0" />
                <span className="truncate">{selectedField.description}</span>
              </Badge>
            )}
            {draft.date && (
              <Badge variant="secondary" className="gap-1.5">
                <CalendarDays className="w-3 h-3 shrink-0" />
                {draft.date.toLocaleDateString("it-IT", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </Badge>
            )}
            {selectedTimeLabel && draft.end_time && (
              <Badge variant="secondary" className="gap-1.5">
                <Clock className="w-3 h-3 shrink-0" />
                {selectedTimeLabel} –{" "}
                {draft.end_time.toTimeString().substring(0, 5)}
              </Badge>
            )}
            {draft.mixed && (
              <Badge variant="outline" className="gap-1.5">
                <Users2 className="w-3 h-3 shrink-0" />
                Squadre miste
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* ── STEP 1: Scelta del campo ──────────────────────────────────── */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
              <SectionHeader
                icon={Layers}
                title="Scegli il campo"
                subtitle="Seleziona lo sport che vuoi praticare"
              />
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4">
              {/* Grid 2 colonne su mobile, flex wrap su schermi più larghi */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                {activeFields
                  .sort((a, b) => a.id - b.id)
                  .map((field) => {
                    const isSelected = draft.id_field === field.id;
                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            id_field: field.id,
                            // Reset orario se il campo cambia (gli slot cambiano)
                            start_time: null,
                            end_time: null,
                          }))
                        }
                        className={[
                          "relative rounded-xl px-4 py-3 text-center w-full",
                          "sm:flex-1 sm:min-w-[110px] sm:max-w-[200px]",
                          "border-2 transition-all duration-200 cursor-pointer font-medium text-sm",
                          "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : "border-border bg-accent/50 text-foreground hover:border-primary/40 hover:bg-accent",
                        ].join(" ")}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 absolute top-2 right-2 opacity-80" />
                        )}
                        {field.description}
                      </button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* ── STEP 2 & 3: Data e Orario ────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selezione della data */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                <SectionHeader
                  icon={CalendarDays}
                  title="Scegli il giorno"
                  subtitle="Disponibile nelle prossime 3 settimane"
                />
              </CardHeader>
              <CardContent className="px-4 sm:px-5 pb-4">
                {/* Tutti i 21 giorni in flex-wrap: nessun giorno nascosto */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {Array.from({ length: 21 }).map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() + index);

                    const isSelected =
                      draft.date?.toDateString() === date.toDateString();
                    const isToday = index === 0;

                    const dayName = date.toLocaleDateString("it-IT", {
                      weekday: "short",
                    });
                    const dayNum = date.toLocaleDateString("it-IT", {
                      day: "numeric",
                    });
                    const monthName = date.toLocaleDateString("it-IT", {
                      month: "short",
                    });

                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                date,
                                // Reset orario se la data cambia (la disponibilità cambia)
                                start_time: null,
                                end_time: null,
                              }))
                            }
                            className={[
                              "flex flex-col items-center justify-center rounded-xl px-3 py-3",
                              "border-2 transition-all duration-200 cursor-pointer w-[64px]",
                              "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-md"
                                : "border-border bg-accent/50 text-foreground hover:border-primary/40 hover:bg-accent",
                            ].join(" ")}
                          >
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wide ${
                                isSelected
                                  ? "opacity-80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {dayName}
                            </span>
                            <span className="text-lg font-bold leading-none my-0.5">
                              {dayNum}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isSelected
                                  ? "opacity-80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {monthName}
                            </span>
                            {/* Punto indicatore per "oggi" */}
                            {isToday && !isSelected && (
                              <span className="mt-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>
                            {isToday
                              ? "Oggi"
                              : date.toLocaleDateString("it-IT", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selezione dell'orario */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                <SectionHeader
                  icon={Clock}
                  title="Scegli l'orario"
                  subtitle={
                    !draft.id_field || !draft.date
                      ? "Seleziona prima il campo e il giorno"
                      : loadingSlots
                        ? "Caricamento orari..."
                        : slotsAvailable.length === 0
                          ? "Nessun orario disponibile"
                          : `${slotsAvailable.length} slot disponibili`
                  }
                />
              </CardHeader>
              <CardContent className="px-4 sm:px-5 pb-4">
                {/* Placeholder: campo o data non ancora scelti */}
                {!draft.id_field || !draft.date ? (
                  <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Scegli prima il campo e il giorno
                    </p>
                  </div>
                ) : loadingSlots ? (
                  /* Skeleton durante il caricamento */
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-11 rounded-xl bg-accent animate-pulse"
                      />
                    ))}
                  </div>
                ) : slotsAvailable.length === 0 ? (
                  /* Empty state */
                  <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border">
                    <p className="text-sm text-muted-foreground">
                      Nessun orario disponibile
                    </p>
                  </div>
                ) : (
                  /* Griglia slot: 3 col mobile, 4 col sm, flex wrap su md+ */
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-2">
                    {slotsAvailable.map((slot) => {
                      const isSelected =
                        draft.start_time?.toTimeString().substring(0, 5) ===
                        slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            const [hours, minutes] = slot
                              .split(":")
                              .map(Number);
                            const startTime = new Date();
                            startTime.setHours(hours, minutes, 0, 0);
                            const endTime = new Date(startTime);
                            endTime.setHours(endTime.getHours() + 1);
                            setDraft((prev) => ({
                              ...prev,
                              start_time: startTime,
                              end_time: endTime,
                            }));
                          }}
                          className={[
                            "rounded-xl py-3 text-sm font-semibold border-2 text-center",
                            "transition-all duration-200 cursor-pointer w-[64px]",
                            "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-accent/50 text-foreground hover:border-primary/40 hover:bg-accent",
                          ].join(" ")}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── STEP 4: Dettagli ─────────────────────────────────────────── */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
              <SectionHeader
                icon={FileText}
                title="Dettagli aggiuntivi"
                subtitle="Personalizza la tua prenotazione"
              />
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-5">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Toggle squadre miste */}
                <div className="w-full md:w-auto md:min-w-[200px]">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-accent/30 h-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Users2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Squadre miste</p>
                        <p className="text-xs text-muted-foreground">
                          {draft.mixed ? "Attivo" : "Non attivo"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={draft.mixed}
                      onCheckedChange={(checked) =>
                        setDraft((prev) => ({ ...prev, mixed: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Separatore: orizzontale su mobile, verticale su md+ */}
                <Separator className="md:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden md:block self-stretch h-auto"
                />

                {/* Campo note */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    Note (opzionale)
                  </label>
                  <Textarea
                    placeholder="Aggiungi informazioni utili per l'organizzatore..."
                    value={draft.notes}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="resize-none min-h-[80px] bg-accent/30 border focus:bg-background transition-colors"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Footer di conferma ───────────────────────────────────────────── */}
        {/* Su mobile si impila verticalmente, su sm+ rimane affiancato */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Potrai annullare fino a 2h prima</span>
          </div>
          <div className="w-full sm:w-1/3">
            <ConfirmNewReservationButton reservation={builtReservation} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
