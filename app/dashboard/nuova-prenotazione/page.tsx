"use client";

import ConfirmNewReservationButton from "@/components/ConfirmNewReservationButton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFields } from "@/context/FieldsContex";
import { ReservationStatus } from "@/lib/enums";
import { fields, reservations } from "@prisma/client";
import {
  ArrowLeft,
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

type ReservationDraft = {
  id_field: number | null;
  id_user: bigint;
  date: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  notes: string;
  mixed: boolean;
};

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Campo", icon: Layers },
  { id: 2, label: "Data", icon: CalendarDays },
  { id: 3, label: "Orario", icon: Clock },
  { id: 4, label: "Conferma", icon: CheckCircle2 },
] as const;

type StepId = 1 | 2 | 3 | 4;

function deriveMaxStep(draft: ReservationDraft): StepId {
  if (!draft.id_field) return 1;
  if (!draft.date) return 2;
  if (!draft.start_time) return 3;
  return 4;
}

// ─── StepIndicator ───────────────────────────────────────────────────────────

function StepIndicator({
  maxStep,
  activeStep,
  onNavigate,
}: {
  maxStep: StepId;
  activeStep: StepId;
  onNavigate: (step: StepId) => void;
}) {
  return (
    <div className="flex items-center w-full px-5 gap-0 shrink-0">
      {STEPS.map((step, idx) => {
        const done = maxStep > step.id;
        const active = activeStep === step.id;
        const navigable = step.id <= maxStep && step.id !== activeStep;
        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => navigable && onNavigate(step.id as StepId)}
              className={[
                "flex flex-col items-center gap-1.5 shrink-0 transition-all duration-200",
                navigable ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <div
                className={[
                  "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : active
                      ? "bg-primary border-primary text-primary-foreground ring-[3px] ring-primary/25 ring-offset-2 ring-offset-background scale-110"
                      : "bg-background border-border/60 text-muted-foreground",
                ].join(" ")}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{step.id}</span>
                )}
              </div>
              <span
                className={[
                  "text-[10px] whitespace-nowrap transition-all duration-200",
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground font-medium",
                ].join(" ")}
              >
                {step.label}
              </span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5 h-[2px] rounded-full bg-border/60 overflow-hidden relative">
                <div
                  className={[
                    "absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500",
                    maxStep > step.id ? "w-full" : "w-0",
                  ].join(" ")}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── SummaryItem ─────────────────────────────────────────────────────────────

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-lg bg-primary/8 text-primary shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-semibold leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {value}
        </p>
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
  const [displayStep, setDisplayStep] = useState<StepId>(1);

  const [draft, setDraft] = useState<ReservationDraft>({
    id_field: null,
    id_user: BigInt(0),
    date: null,
    start_time: null,
    end_time: null,
    notes: "",
    mixed: false,
  });

  const maxStep = deriveMaxStep(draft);
  const selectedField =
    activeFields.find((f) => f.id === draft.id_field) ?? null;

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      setDraft((prev) => ({ ...prev, id_user: BigInt(session.user.id) }));
    }
  }, [session, sessionStatus]);

  useEffect(() => {
    setDisplayStep((prev) => {
      const derived = deriveMaxStep(draft);
      return derived > prev ? derived : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id_field, draft.date, draft.start_time]);

  useEffect(() => {
    if (!draft.id_field || !draft.date) return;
    setLoadingSlots(true);
    setSlotsAvailable([]);
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

  function buildReservation(): Omit<reservations, "id"> | null {
    if (!draft.id_field || !draft.date || !draft.start_time || !draft.end_time)
      return null;
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
      id_reservation_fixed: null,
    };
  }

  const builtReservation = buildReservation();

  const stepMeta: Record<StepId, { title: string; subtitle?: string }> = {
    1: {
      title: "Quale campo?",
      subtitle: "Scegli il campo da prenotare",
    },
    2: {
      title: "Quando vuoi giocare?",
      subtitle: selectedField
        ? `Campo: ${selectedField.description}`
        : undefined,
    },
    3: {
      title: "A che ora?",
      subtitle: [
        selectedField?.description,
        draft.date?.toLocaleDateString("it-IT", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      ]
        .filter(Boolean)
        .join(" · "),
    },
    4: {
      title: "Conferma",
      subtitle: "Controlla e prenota",
    },
  };

  const { title, subtitle } = stepMeta[displayStep];

  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    // Fills the parent flex-1 container exactly — no page-level scroll
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col gap-0.5 mb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Nuova Prenotazione
        </h1>
        <p className="text-xs text-muted-foreground">
          Prenota la tua prossima partita.
        </p>
      </div>

      {/* ── Step indicator ─────────────────────────────────────────────── */}
      <StepIndicator
        maxStep={maxStep}
        activeStep={displayStep}
        onNavigate={setDisplayStep}
      />

      {/* ── Step content — fills remaining height ──────────────────────── */}
      <div
        key={displayStep}
        className="flex-1 min-h-0 mt-6 flex flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
      >
        {/* Step header — fixed height */}
        <div className="shrink-0 flex items-start gap-3">
          {displayStep > 1 && (
            <button
              type="button"
              onClick={() =>
                setDisplayStep((prev) => Math.max(1, prev - 1) as StepId)
              }
              className={[
                "p-2 rounded-full border border-border/60 bg-background",
                "hover:bg-muted hover:border-border shadow-sm transition-all duration-200",
                "active:scale-95 shrink-0 mt-0.5",
              ].join(" ")}
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary mb-1">
              Passo {displayStep} di {STEPS.length}
            </span>
            <h2 className="text-xl font-bold tracking-tight leading-tight text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ── STEP 1: Campo — cards grow to fill remaining height ─────── */}
        {displayStep === 1 && (
          <div
            className="flex-1 min-h-0 grid grid-cols-2 gap-3"
            style={{ gridAutoRows: "1fr" }}
          >
            {activeFields
              .sort((a, b) => a.id - b.id)
              .map((field, idx) => {
                const isSelected = draft.id_field === field.id;
                return (
                  <button
                    key={field.id}
                    type="button"
                    style={{
                      animationDelay: `${idx * 70}ms`,
                      animationFillMode: "both",
                    }}
                    className={[
                      "animate-in fade-in-0 slide-in-from-bottom-3 duration-300",
                      "relative rounded-2xl px-4 text-center w-full h-full",
                      "border-2 font-semibold text-base transition-all duration-200 cursor-pointer",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      "active:scale-[0.97]",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "border-border/60 bg-card text-foreground hover:border-primary/40 hover:bg-accent/40 hover:shadow-md",
                    ].join(" ")}
                    onClick={() =>
                      setDraft((prev) => {
                        if (prev.id_field === field.id) return prev;
                        return {
                          ...prev,
                          id_field: field.id,
                          date: null,
                          start_time: null,
                          end_time: null,
                        };
                      })
                    }
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 absolute top-3 right-3 opacity-90" />
                    )}
                    {field.description}
                  </button>
                );
              })}
          </div>
        )}

        {/* ── STEP 2: Data — 3 rows each fills 1/3 of remaining height ── */}
        {displayStep === 2 && (
          <div className="flex-1 min-h-0 flex flex-col gap-2">
            {[0, 1, 2].map((week) => (
              <div
                key={week}
                className="flex-1 min-h-0 grid grid-cols-7 gap-1.5"
              >
                {days.slice(week * 7, week * 7 + 7).map((date, idx) => {
                  const isSelected =
                    draft.date?.toDateString() === date.toDateString();
                  const isToday = week === 0 && idx === 0;
                  const globalIdx = week * 7 + idx;
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
                    <button
                      key={date.toDateString()}
                      type="button"
                      style={{
                        animationDelay: `${globalIdx * 20}ms`,
                        animationFillMode: "both",
                      }}
                      className={[
                        "animate-in fade-in-0 duration-300",
                        "flex flex-col items-center justify-center gap-0.5 rounded-xl w-full h-full",
                        "border-2 transition-all duration-200 cursor-pointer",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        "active:scale-95",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : isToday
                            ? "border-primary/30 bg-primary/5 text-foreground hover:border-primary/50 hover:bg-primary/10"
                            : "border-border/60 bg-card text-foreground hover:border-primary/40 hover:bg-accent/40",
                      ].join(" ")}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          date,
                          start_time: null,
                          end_time: null,
                        }))
                      }
                    >
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${
                          isSelected ? "opacity-70" : "text-muted-foreground"
                        }`}
                      >
                        {dayName}
                      </span>
                      <span
                        className={`text-base leading-none ${
                          isSelected ? "font-black" : "font-bold"
                        }`}
                      >
                        {dayNum}
                      </span>
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wide leading-none ${
                          isSelected
                            ? "opacity-60"
                            : isToday
                              ? "text-primary font-black"
                              : "text-muted-foreground"
                        }`}
                      >
                        {monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 3: Orario — compact grid, top-aligned ─────────────── */}
        {displayStep === 3 && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loadingSlots ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-xl bg-muted/60 animate-pulse"
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
            ) : slotsAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 h-full rounded-2xl border-2 border-dashed border-border/50">
                <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Nessuna disponibilità
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Non ci sono orari liberi per questo giorno
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDisplayStep(2)}
                  className="text-sm text-primary font-semibold hover:underline underline-offset-2"
                >
                  Scegli un altro giorno
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 content-start">
                {slotsAvailable.map((slot, idx) => {
                  const isSelected =
                    draft.start_time?.toTimeString().substring(0, 5) === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      style={{
                        animationDelay: `${idx * 35}ms`,
                        animationFillMode: "both",
                      }}
                      className={[
                        "animate-in fade-in-0 duration-300",
                        "rounded-xl py-2 text-xs font-bold border-2 text-center",
                        "transition-all duration-200 cursor-pointer",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        "active:scale-95",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "border-border/60 bg-card text-foreground hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm",
                      ].join(" ")}
                      onClick={() => {
                        const [hours, minutes] = slot.split(":").map(Number);
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
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Conferma — scrollable internally ───────────────── */}
        {displayStep === 4 && (
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pb-1">
            {/* Booking summary */}
            <div className="shrink-0 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 flex flex-col gap-3">
                <SummaryItem
                  icon={Layers}
                  label="Campo"
                  value={selectedField?.description ?? "—"}
                />
                <div className="h-px bg-border/40" />
                <SummaryItem
                  icon={CalendarDays}
                  label="Giorno"
                  value={
                    draft.date?.toLocaleDateString("it-IT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    }) ?? "—"
                  }
                />
                <div className="h-px bg-border/40" />
                <SummaryItem
                  icon={Clock}
                  label="Orario"
                  value={
                    draft.start_time && draft.end_time
                      ? `${draft.start_time.toTimeString().substring(0, 5)} – ${draft.end_time.toTimeString().substring(0, 5)}`
                      : "—"
                  }
                />
              </div>
            </div>

            {/* Extra details */}
            <div className="shrink-0 flex flex-col gap-3">
              <div
                className={[
                  "flex items-center justify-between gap-4 px-4 py-3.5",
                  "rounded-2xl border border-border/60 bg-card shadow-sm",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <Users2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Squadre miste
                    </p>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  Note{" "}
                  <span className="font-normal text-muted-foreground">
                    (opzionale)
                  </span>
                </label>
                <Textarea
                  placeholder="Aggiungi informazioni per l'organizzatore..."
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="resize-none min-h-[72px] bg-card border-border/60 rounded-2xl text-sm"
                  rows={2}
                />
              </div>
            </div>

            {/* Confirm CTA */}
            <div className="shrink-0 flex flex-col items-center gap-2.5 pt-1">
              <div className="w-full">
                <ConfirmNewReservationButton reservation={builtReservation} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Potrai annullare fino a 2h prima</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
