"use client";

/**
 * Pagina di dettaglio/creazione di una prenotazione.
 *
 * Route:
 *   - /dashboard/partite/new    → Nuova prenotazione (mostra ReservationUserSelection)
 *   - /dashboard/partite/[id]   → Dettaglio prenotazione esistente
 *
 * La logica di fetch, delete e gestione stato è invariata.
 * Il layout è stato ridisegnato con hero section, avatar e card.
 */

import DeleteReservationButton from "@/components/deletereservation-button";
import ReservationDetailForm from "@/components/ReservationDetailForm";
import ReservationPaymentsTable from "@/components/ReservationPaymentsTable";
import ReservationUserSelection from "@/components/ReservationUserSelection";
import ReservationStatusBadge from "@/components/ReservationStatusBadge";
import { useFields } from "@/context/FieldsContex";
import { ReservationStatus } from "@/lib/enums";
import { fields, reservations, users_wallets } from "@prisma/client";
import { ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [reservation, setReservation] = useState<reservations | null>(null);
  const [reservationUser, setReservationUser] = useState<users_wallets | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(id !== "new");

  const availableFields: fields[] = useFields();

  // ── Caricamento prenotazione esistente ─────────────────────────────────
  useEffect(() => {
    if (id === "new") return;

    setLoading(true);
    fetch("/api/reservations/" + id, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setReservation(data);
        setReservationUser(data.users);
      })
      .catch(() => {
        toast.error("Errore durante il caricamento della prenotazione.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Eliminazione prenotazione — logica invariata ───────────────────────
  function deleteReservation() {
    if (!reservation) return;

    fetch(`/api/reservations/${reservation.id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: ReservationStatus.DELETED }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(() => {
        toast.success("Prenotazione eliminata con successo.");
        window.location.href = "/dashboard/partite";
      })
      .catch(() => {
        toast.error("Errore durante l'eliminazione della prenotazione.");
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /** Iniziali per l'avatar utente */
  function getInitials(name?: string | null, surname?: string | null): string {
    const first = name?.[0]?.toUpperCase() ?? "";
    const last = surname?.[0]?.toUpperCase() ?? "";
    return first + last || "?";
  }

  /** Nome campo associato alla prenotazione */
  const fieldName =
    availableFields.find((f) => f.id === reservation?.id_field)?.description ??
    "";

  /** Nominativo visualizzato nell'header */
  const displayName = reservationUser?.name
    ? `${reservationUser.name} ${
        reservationUser.surname || reservation?.user_not_registered || ""
      }`.trim()
    : (reservation?.user_not_registered ?? "");

  return (
    <div className="w-full flex flex-col gap-6 overflow-y-auto pb-6">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Striscia decorativa superiore */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5">
          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Link
                href="/dashboard/partite"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <LayoutGrid className="size-3" />
                Partite
              </Link>
              <ChevronRight className="size-3 shrink-0" />
              <span className="font-medium text-foreground">
                {id === "new" ? "Nuova prenotazione" : `#${id}`}
              </span>
            </nav>

            {id !== "new" && (
              <>
                {/* Riga principale: avatar + nome + badge */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Avatar con iniziali */}
                  {!loading && (
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary shrink-0">
                      {getInitials(
                        reservationUser?.name,
                        reservationUser?.surname,
                      )}
                    </div>
                  )}

                  <div>
                    {loading ? (
                      /* Skeleton loading */
                      <div className="flex flex-col gap-1.5">
                        <div className="h-6 w-48 rounded-md bg-muted animate-pulse" />
                        <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">
                          {displayName || (
                            <span className="text-muted-foreground italic">
                              Utente sconosciuto
                            </span>
                          )}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                          {reservationUser?.nickname && (
                            <span className="text-sm text-muted-foreground">
                              @{reservationUser.nickname}
                            </span>
                          )}
                          {fieldName && (
                            <span className="text-xs text-muted-foreground">
                              · {fieldName}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Badge stato + pulsante elimina */}
          {!loading && reservation && (
            <div className="flex items-center gap-3 shrink-0">
              <ReservationStatusBadge
                idStatus={reservation.id_status}
                size="md"
              />
              <DeleteReservationButton deleteReservation={deleteReservation} />
            </div>
          )}
        </div>
      </div>

      {/* ── Corpo pagina ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Colonna sinistra: form dettaglio */}
        {reservation && (
          <div className="flex-1 min-w-0">
            <ReservationDetailForm reservation={reservation} />
          </div>
        )}

        {/* Colonna destra: tabella pagamenti */}
        {reservation && (
          <div className="flex-1 min-w-0">
            <ReservationPaymentsTable reservation={reservation} />
          </div>
        )}

        {/* Vista "new": selezione utente */}
        {!reservation && !loading && (
          <div className="flex-1 min-w-0">
            <ReservationUserSelection
              user={reservationUser}
              setUser={setReservationUser}
            />
          </div>
        )}

        {/* Skeleton per colonne in caricamento */}
        {loading && (
          <>
            <div className="flex-1 min-h-[400px] rounded-xl border border-border bg-card shadow-sm animate-pulse" />
            <div className="flex-1 min-h-[400px] rounded-xl border border-border bg-card shadow-sm animate-pulse" />
          </>
        )}
      </div>
    </div>
  );
}
