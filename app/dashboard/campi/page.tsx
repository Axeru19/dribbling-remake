"use client";

/**
 * Pagina admin: gestione dei campi sportivi.
 *
 * Mostra la lista dei campi disponibili nel centro sportivo.
 * Cliccando su una FieldCard si attiva/disattiva il campo (toggle di status).
 * I campi attivi sono prenotabili dagli utenti, quelli disattivi no.
 *
 * Logica di fetch e toggle invariata rispetto all'originale.
 */

import { cn } from "@/lib/utils";
import { fields } from "@prisma/client";
import {
  CheckCircle2,
  MapPin,
  Plus,
  Power,
  PowerOff,
  Trophy,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ─── Pagina ────────────────────────────────────────────────────────────────

export default function Page() {
  const [fields, setFields] = useState<fields[]>([]);
  const [reload, setReload] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch campi — logica invariata ─────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/fields/list")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data: fields[]) => setFields(data))
      .catch(() => toast.error("Errore durante il caricamento dei campi."))
      .finally(() => setIsLoading(false));
  }, [reload]);

  const activeCount = fields.filter((f) => f.status).length;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campi</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {activeCount} attiv{activeCount === 1 ? "o" : "i"}
              </span>
              {" · "}
              {fields.length - activeCount} disattiv
              {fields.length - activeCount === 1 ? "o" : "i"}
              {" · "}
              {fields.length} totali
            </p>
          )}
        </div>

        {/* Pulsante "Aggiungi campo" (disabilitato come nell'originale) */}
        <Button disabled className="gap-2">
          <Plus className="size-4" />
          Aggiungi campo
        </Button>
      </div>

      {/* ── Griglia campi ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          /* Skeleton */
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {fields
              .sort((a, b) => a.id - b.id)
              .map((field) => (
                <FieldCard key={field.id} field={field} setReload={setReload} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FieldCard ──────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: fields;
  setReload?: React.Dispatch<React.SetStateAction<number>>;
}

function FieldCard({ field, setReload }: FieldCardProps) {
  const [pending, setPending] = useState(false);

  // ── Toggle attivo/disattivo — logica invariata ───────────────────────────
  function toggleFieldStatus() {
    if (pending) return;
    setPending(true);

    fetch(`/api/fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field.status),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(() => {
        toast.success("Campo aggiornato con successo.");
        setReload?.((prev) => prev + 1);
      })
      .catch(() => toast.error("Errore durante l'aggiornamento del campo."))
      .finally(() => setPending(false));
  }

  const isActive = Boolean(field.status);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggleFieldStatus}
      onKeyDown={(e) => e.key === "Enter" && toggleFieldStatus()}
      aria-label={`Campo ${field.description} — ${isActive ? "attivo, clicca per disattivare" : "disattivo, clicca per attivare"}`}
      className={cn(
        // Base
        "relative overflow-hidden rounded-2xl border bg-card",
        "flex flex-col cursor-pointer select-none",
        "transition-all duration-300",
        // Attivo
        isActive
          ? "border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
          : "border-border opacity-70 hover:opacity-90 hover:shadow-sm",
        // Loading
        pending && "pointer-events-none opacity-60",
      )}
    >
      {/* ── Banda colorata superiore ──────────────────────────────────── */}
      <div
        className={cn(
          "h-1.5 w-full transition-colors duration-300",
          isActive
            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
            : "bg-gradient-to-r from-muted-foreground/30 to-muted/30",
        )}
      />

      {/* ── Corpo card ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-5">
        {/* Icona campo + status badge */}
        <div className="flex items-start gap-3">
          {/* Icona decorativa con colore dinamico */}
          <div
            className={cn(
              "flex items-center justify-center size-11 rounded-xl shrink-0 transition-colors duration-300",
              isActive
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Trophy className="size-5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Nome campo */}
            <h3 className="font-semibold text-foreground text-base leading-tight truncate">
              {field.description}
            </h3>
            {/* ID campo */}
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              Campo #{field.id}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors duration-300",
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isActive ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <XCircle className="size-3" />
            )}
            {isActive ? "Attivo" : "Disattivo"}
          </span>
        </div>

        {/* Descrizione stato */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isActive
            ? "Questo campo è prenotabile. Gli utenti possono visualizzarlo e selezionarlo."
            : "Questo campo è disattivato. Non sarà visibile né prenotabile dagli utenti."}
        </p>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* CTA toggle */}
        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-2.5 px-4",
            "text-sm font-semibold transition-colors duration-200",
            isActive
              ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950",
          )}
        >
          {pending ? (
            <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : isActive ? (
            <PowerOff className="size-4" />
          ) : (
            <Power className="size-4" />
          )}
          {pending
            ? "Aggiornamento…"
            : isActive
              ? "Clicca per disattivare"
              : "Clicca per attivare"}
        </div>
      </div>
    </div>
  );
}
