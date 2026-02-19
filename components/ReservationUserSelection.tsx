"use client";

/**
 * ReservationUserSelection
 *
 * Pannello per la ricerca e selezione dell'utente durante la creazione
 * di una nuova prenotazione (route partite/new).
 * La logica di debounce, API call e inserimento prenotazione è invariata.
 */

import { users_wallets } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Search, UserPlus, UserCheck, Users, ArrowRight } from "lucide-react";

interface ReservationUserSelectionProps {
  user: users_wallets | null;
  setUser: (user: users_wallets | null) => void;
}

/** Restituisce le iniziali dall'utente (max 2 caratteri) */
function getInitials(name?: string | null, surname?: string | null): string {
  const first = name?.[0]?.toUpperCase() ?? "";
  const last = surname?.[0]?.toUpperCase() ?? "";
  return first + last || "?";
}

export default function ReservationUserSelection({
  user,
  setUser,
}: ReservationUserSelectionProps) {
  const [userSearch, setUserSearch] = useState<string>("");
  const [userList, setUserList] = useState<users_wallets[] | null>(null);

  // ── Debounce ricerca utenti ─────────────────────────────────────────────
  useEffect(() => {
    if (!userSearch || userSearch === "") {
      setUserList(null);
      return;
    }
    const timeout = setTimeout(() => {
      fetch("/api/users/list", {
        method: "POST",
        body: JSON.stringify({ filter: userSearch }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data: users_wallets[]) => setUserList(data))
        .catch(() =>
          toast.error("Errore durante il caricamento degli utenti."),
        );
    }, 500);

    return () => clearTimeout(timeout);
  }, [userSearch]);

  // ── Inserimento prenotazione — logica invariata ─────────────────────────
  function insertReservation() {
    const userSelected: string | number =
      userSearch.length > 0 && userList && userList.length === 0
        ? userSearch
        : user?.user_id
          ? Number(user!.user_id)
          : 0;

    fetch("/api/reservations/insert", {
      method: "POST",
      body: JSON.stringify({ user: userSelected }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        toast.success("Prenotazione inserita con successo.");
        window.location.href = "/dashboard/partite/" + data.id;
      })
      .catch(() =>
        toast.error("Errore durante l'inserimento della prenotazione."),
      );
  }

  /** True quando siamo pronti a creare la prenotazione */
  const canInsert =
    (userSearch.length > 0 && userList !== null && userList.length === 0) ||
    (userList !== null && userList.length > 0 && user !== null);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full gap-6 py-8">
      {/* ── Hero icon ──────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 shadow-sm">
          <Users className="size-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Nuova prenotazione
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cerca l&apos;utente da associare alla partita
          </p>
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9 h-11 text-base rounded-xl border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/40 transition-shadow"
          placeholder="Cerca per nome, cognome o nickname…"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* ── Lista risultati ────────────────────────────────────────────── */}
      {userList !== null && (
        <div className="w-full max-w-md flex flex-col gap-2">
          {userList.length === 0 ? (
            /* Utente non registrato */
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Nessun utente trovato per{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{userSearch}&rdquo;
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Verrà creata una prenotazione con utente non registrato.
              </p>
            </div>
          ) : (
            userList.map((u) => {
              const isSelected = Number(u.user_id) === Number(user?.user_id);
              return (
                <div
                  key={u.user_id}
                  onClick={() => setUser(u)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  {/* Avatar iniziali */}
                  <div
                    className={cn(
                      "flex items-center justify-center size-9 rounded-full text-sm font-bold shrink-0",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {getInitials(u.name, u.surname)}
                  </div>

                  {/* Info utente */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {u.name} {u.surname}
                    </p>
                    {u.nickname && (
                      <p className="text-xs text-muted-foreground truncate">
                        @{u.nickname}
                      </p>
                    )}
                  </div>

                  {/* Indicatore selezione */}
                  {isSelected && (
                    <UserCheck className="size-4 text-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── CTA Button ─────────────────────────────────────────────────── */}
      {canInsert && (
        <Button
          className="w-full max-w-md gap-2 h-11 text-base rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
          onClick={insertReservation}
        >
          {userList !== null && userList.length === 0 ? (
            <>
              <UserPlus className="size-4" />
              Crea con utente non registrato
            </>
          ) : (
            <>
              <ArrowRight className="size-4" />
              Inserisci prenotazione
            </>
          )}
        </Button>
      )}
    </div>
  );
}
