/**
 * ReservationStatusBadge
 *
 * Componente badge che visualizza lo stato di una prenotazione
 * con colore e label localizzata in italiano.
 * Mappa gli enum ReservationStatus / ReservationStatusColor definiti in lib/enums.ts
 */

import { ReservationStatus, ReservationStatusColor } from "@/lib/enums";
import React from "react";

/** Mappa id_status → label visualizzata */
const STATUS_LABELS: Record<number, string> = {
  [ReservationStatus.INCOMING]: "In attesa",
  [ReservationStatus.CONFIRMED]: "Confermata",
  [ReservationStatus.REJECTED]: "Rifiutata",
  [ReservationStatus.DELETED]: "Eliminata",
};

/** Mappa id_status → colore HEX (dalla palette ReservationStatusColor) */
const STATUS_COLORS: Record<number, string> = {
  [ReservationStatus.INCOMING]: ReservationStatusColor.INCOMING,
  [ReservationStatus.CONFIRMED]: ReservationStatusColor.CONFIRMED,
  [ReservationStatus.REJECTED]: ReservationStatusColor.REJECTED,
  [ReservationStatus.DELETED]: ReservationStatusColor.DELETED,
};

interface ReservationStatusBadgeProps {
  /** id_status proveniente dal record reservations */
  idStatus: number | null | undefined;
  /** Dimensione del badge: 'sm' (default) o 'md' */
  size?: "sm" | "md";
}

export default function ReservationStatusBadge({
  idStatus,
  size = "sm",
}: ReservationStatusBadgeProps) {
  // Fallback nel caso in cui lo stato non sia riconosciuto
  const label =
    idStatus != null ? (STATUS_LABELS[idStatus] ?? "Sconosciuto") : "—";
  const color =
    idStatus != null ? (STATUS_COLORS[idStatus] ?? "#888888") : "#888888";

  const sizeClasses =
    size === "md"
      ? "px-3 py-1.5 text-sm font-semibold"
      : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClasses} tracking-wide`}
      style={{
        backgroundColor: `${color}22`, // 13% opacity background
        color: color,
        border: `1px solid ${color}55`, // 33% opacity border
      }}
    >
      {/* Pallino indicatore */}
      <span
        className="mr-1.5 inline-block size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
