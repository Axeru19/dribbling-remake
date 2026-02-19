"use client";

/**
 * ReservationPaymentsTable
 *
 * Tabella dei pagamenti associati a una prenotazione esistente.
 * Visualizza un empty state quando non ci sono pagamenti.
 * La struttura dati (reservation prop) è invariata rispetto all'originale.
 */

import { reservations } from "@prisma/client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Receipt } from "lucide-react";

interface ReservationPaymentsTableProps {
  reservation?: reservations;
}

export default function ReservationPaymentsTable({
  reservation,
}: ReservationPaymentsTableProps) {
  // TODO: fetch dei pagamenti tramite reservation.id quando l'API sarà disponibile
  const payments: unknown[] = [];

  return (
    <div className="w-full h-full rounded-xl border border-border bg-card shadow-sm flex flex-col">
      {/* Header card */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
            <CreditCard className="size-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Pagamenti</h3>
            <p className="text-xs text-muted-foreground">
              Storico dei pagamenti ricevuti
            </p>
          </div>
        </div>

        {/* Badge contatore */}
        {payments.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {payments.length}
          </span>
        )}
      </div>

      {/* Corpo: tabella o empty state */}
      <div className="flex-1 overflow-auto">
        {payments.length === 0 ? (
          /* ── Empty state ──────────────────────────────────── */
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex items-center justify-center size-14 rounded-full bg-muted">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Nessun pagamento registrato
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I pagamenti associati a questa prenotazione appariranno qui.
              </p>
            </div>
          </div>
        ) : (
          /* ── Tabella pagamenti ────────────────────────────── */
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Utente
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Importo
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Metodo
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Note
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Le righe vengono renderizzate dall'implementazione futura */}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
