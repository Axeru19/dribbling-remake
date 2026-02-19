"use client";

/**
 * Pagina admin: lista utenti con ricerca e filtro.
 *
 * - Mostra tutti gli utenti in una griglia responsive di UserCard
 * - Ricerca con debounce (500ms) su nome, cognome, nickname, email, telefono
 * - Cliccando su una card si apre il UserDialog per la modifica
 * - Il flag `reload` permette di ricaricare la lista dopo una modifica
 */

import React, { useEffect, useState } from "react";
import { users_wallets } from "@prisma/client";
import { toast } from "sonner";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserCard from "@/components/UserCard";
import UserDialog from "@/components/user-dialog";

export default function Page() {
  const [users, setUsers] = useState<users_wallets[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [userSelected, setUserSelected] = useState<users_wallets | null>(null);
  const [reload, setReload] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Fetch utenti con debounce ────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    const handler = setTimeout(() => {
      fetch("/api/users/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter }),
      })
        .then((res) => {
          if (!res.ok)
            throw new Error("Errore durante il recupero degli utenti");
          return res.json();
        })
        .then((data: users_wallets[]) => setUsers(data))
        .catch(() =>
          toast.error(
            "Si è verificato un errore durante il recupero degli utenti.",
          ),
        )
        .finally(() => setIsLoading(false));
    }, 500);

    return () => clearTimeout(handler);
  }, [filter, reload]);

  // ── Handler selezione utente ─────────────────────────────────────────────
  function handleEdit(user: users_wallets) {
    setUserSelected(user);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            Utenti
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? "Caricamento…"
              : `${users.length} utent${users.length === 1 ? "e" : "i"} ${filter ? "trovati" : "totali"}`}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 h-10 rounded-xl bg-muted/50 border-border focus-visible:bg-background transition-colors"
            placeholder="Cerca per nome, email, nickname…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* ── Griglia utenti ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          /* Skeleton grid */
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Nessun utente trovato
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filter
                  ? `Prova a cercare con un termine diverso da "${filter}".`
                  : "Non ci sono ancora utenti registrati."}
              </p>
            </div>
          </div>
        ) : (
          /* Card grid */
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <UserCard key={user.user_id} user={user} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog modifica utente ────────────────────────────────────── */}
      {userSelected && (
        <UserDialog
          user={userSelected}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          setReload={setReload}
        />
      )}
    </div>
  );
}
