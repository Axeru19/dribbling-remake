"use client";

import { cn } from "@/lib/utils";
import { fields } from "@prisma/client";
import {
  Activity,
  CheckCircle2,
  Edit2,
  Power,
  Save,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type EditState = "idle" | "editing" | "saving";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [fieldList, setFieldList] = useState<fields[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/fields/list")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: fields[]) => setFieldList(data))
      .catch(() => toast.error("Errore durante il caricamento dei campi."))
      .finally(() => setIsLoading(false));
  }, [reload]);

  const sorted = [...fieldList].sort((a, b) => a.id - b.id);

  return (
    <div className="flex flex-col h-full gap-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
            Amministrazione
          </p>
          <h1 className="text-[28px] font-bold tracking-tight leading-none text-foreground">
            Gestione Campi
          </h1>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonGrid />
        ) : sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {sorted.map((field, i) => (
              <FieldCard
                key={field.id}
                field={field}
                index={i}
                setReload={setReload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

function Stat({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: "emerald" | "zinc" | "amber";
}) {
  const colorMap = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    zinc: "text-zinc-500 dark:text-zinc-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="text-right">
      <p
        className={cn(
          "text-[20px] font-bold font-mono tabular-nums leading-none",
          colorMap[color],
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

// ─── FieldCard ────────────────────────────────────────────────────────────────

interface FieldCardProps {
  field: fields;
  index: number;
  setReload: React.Dispatch<React.SetStateAction<number>>;
}

function FieldCard({ field, setReload }: FieldCardProps) {
  const [toggling, setToggling] = useState(false);
  const [editState, setEditState] = useState<EditState>("idle");
  const [priceInput, setPriceInput] = useState(
    field.price_per_hour?.toFixed(2) ?? "",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = Boolean(field.status);

  useEffect(() => {
    if (editState === "editing") {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editState]);

  function toggleStatus() {
    if (toggling) return;
    setToggling(true);
    fetch(`/api/fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field.status),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success(isActive ? "Campo disattivato." : "Campo attivato.");
        setReload((p) => p + 1);
      })
      .catch(() => toast.error("Errore durante l'aggiornamento."))
      .finally(() => setToggling(false));
  }

  function savePrice() {
    const parsed = parseFloat(priceInput.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Inserisci un prezzo valido.");
      return;
    }
    setEditState("saving");
    fetch(`/api/fields/${field.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_per_hour: parsed }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        toast.success("Prezzo aggiornato.");
        setReload((p) => p + 1);
        setEditState("idle");
      })
      .catch(() => {
        toast.error("Errore durante il salvataggio.");
        setEditState("editing");
      });
  }

  function cancelEdit() {
    setPriceInput(field.price_per_hour?.toFixed(2) ?? "");
    setEditState("idle");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") savePrice();
    if (e.key === "Escape") cancelEdit();
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]",
        isActive
          ? "border-zinc-200 dark:border-zinc-700 shadow-sm"
          : "border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-90",
      )}
    >
      {/* Status strip */}
      <div
        className={cn(
          "h-[3px] w-full transition-colors duration-500",
          isActive ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700",
        )}
      />

      <div className="flex flex-col gap-5 p-6">
        {/* ── Identity + status ────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[15px] text-foreground leading-tight">
              {field.description ?? `Campo ${field.id}`}
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {isActive
                ? "Disponibile per prenotazioni"
                : "Non prenotabile dagli utenti"}
            </p>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shrink-0",
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {isActive ? (
              <CheckCircle2 className="size-3 shrink-0" />
            ) : (
              <XCircle className="size-3 shrink-0" />
            )}
            {isActive ? "Attivo" : "Disattivo"}
          </span>
        </div>

        {/* ── Price section ─────────────────────────────────────────── */}
        <div className="group/price rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-700/40 p-4">
          <p className="text-[10px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Prezzo per ora
          </p>

          {editState === "idle" ? (
            <div className="flex items-end justify-between gap-2">
              <p className="text-[22px] font-bold font-mono tabular-nums text-foreground leading-none">
                {field.price_per_hour != null
                  ? `€ ${field.price_per_hour.toFixed(2)}`
                  : "—"}
              </p>
              <button
                onClick={() => setEditState("editing")}
                aria-label="Modifica prezzo"
                className={cn(
                  "flex items-center gap-1.5 text-[11px] text-muted-foreground",
                  "px-2.5 py-1.5 rounded-lg transition-colors",
                  "hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                )}
              >
                <Edit2 className="size-3" />
                Modifica
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground shrink-0">
                €
              </span>
              <input
                ref={inputRef}
                type="number"
                min="0"
                step="0.5"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={editState === "saving"}
                placeholder="0.00"
                aria-label="Prezzo per ora in euro"
                className={cn(
                  "flex-1 min-w-0 bg-background border border-border rounded-lg",
                  "px-3 py-1.5 text-sm font-mono",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/60",
                  "transition-all disabled:opacity-50",
                )}
              />
              <button
                onClick={savePrice}
                disabled={editState === "saving"}
                aria-label="Salva prezzo"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors active:scale-95 disabled:opacity-50 shrink-0"
              >
                {editState === "saving" ? (
                  <span className="size-3 rounded-full border-[1.5px] border-white border-t-transparent animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
              </button>
              <button
                onClick={cancelEdit}
                disabled={editState === "saving"}
                aria-label="Annulla"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 text-muted-foreground transition-colors active:scale-95 disabled:opacity-50 shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Toggle ────────────────────────────────────────────────── */}
        <button
          onClick={toggleStatus}
          disabled={toggling}
          className={cn(
            "flex items-center justify-center gap-2 w-full rounded-xl py-2.5",
            "text-sm font-semibold border transition-all duration-200",
            "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
            isActive
              ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-950/40"
              : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/40",
          )}
        >
          {toggling ? (
            <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <Power className="size-4" />
          )}
          {toggling
            ? "Aggiornamento…"
            : isActive
              ? "Disattiva campo"
              : "Attiva campo"}
        </button>
      </div>
    </div>
  );
}

// ─── SkeletonGrid ─────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="h-[3px] w-full bg-zinc-100 dark:bg-zinc-800" />
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-3 w-44 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted animate-pulse shrink-0" />
            </div>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-700/40 p-4 space-y-3">
              <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
              <div className="h-7 w-24 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
        <Activity className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-[14px] text-foreground">
          Nessun campo configurato
        </p>
        <p className="text-[13px] text-muted-foreground mt-1">
          Aggiungi campi sportivi per iniziare.
        </p>
      </div>
    </div>
  );
}
