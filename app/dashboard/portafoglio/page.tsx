"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletUpdateType, ReservationStatus } from "@/lib/enums";
import { AppUser } from "@/types/types.d";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  DoorOpen,
  Hash,
  Inbox,
  Info,
  Loader2,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

interface WalletData {
  user_id: number;
  wallet_id: number | null;
  balance: number | null;
}

interface ReservationPreview {
  id: number;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  notes: string | null;
  id_user: number | null;
  id_status: number | null;
}

type PayStep = "idle" | "searching" | "found" | "paying" | "done";

// ── Balance skeleton ───────────────────────────────────────────────────────

function BalanceSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      <div className="h-3 w-24 rounded-md bg-white/10" />
      <div className="h-12 w-48 rounded-md bg-white/10" />
    </div>
  );
}

// ── No wallet state ────────────────────────────────────────────────────────

function NoWallet() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
        <Inbox className="w-7 h-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-sm">Nessun portafoglio</p>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          Non hai ancora un portafoglio associato. Contatta un amministratore.
        </p>
      </div>
    </div>
  );
}

// ── Inline error ───────────────────────────────────────────────────────────

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/15 rounded-xl px-3 py-2.5">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

// ── How-it-works steps data ────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    title: "Cerca la prenotazione",
    desc: "Inserisci l'ID numerico della prenotazione che vuoi saldare e clicca su Cerca.",
  },
  {
    title: "Verifica i dettagli",
    desc: "Controlla data, orario e campo prima di procedere al pagamento.",
  },
  {
    title: "Inserisci l'importo e paga",
    desc: "Specifica la cifra da scalare dal saldo e conferma. L'operazione è immediata.",
  },
];

// ── Main page ──────────────────────────────────────────────────────────────

export default function PortafoglioPage() {
  const { data: session } = useSession();
  const user = session?.user as AppUser | undefined;

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  const [reservationId, setReservationId] = useState("");
  const [amount, setAmount] = useState("");
  const [payStep, setPayStep] = useState<PayStep>("idle");
  const [reservation, setReservation] = useState<ReservationPreview | null>(
    null,
  );
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingWallet(true);
    fetch(`/api/wallets/${user.id}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error();
        return res.json() as Promise<WalletData>;
      })
      .then((data) => setWallet(data))
      .catch(() => toast.error("Errore nel caricamento del portafoglio"))
      .finally(() => setLoadingWallet(false));
  }, [user?.id]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const id = reservationId.trim();
    if (!id) return;
    setPayStep("searching");
    setReservation(null);
    setPayError(null);

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id) }),
      });

      if (!res.ok) throw new Error("Prenotazione non trovata");
      const data = (await res.json()) as ReservationPreview | null;

      if (!data || !data.id) throw new Error("Prenotazione non trovata");

      if (String(data.id_user) !== String(user?.id)) {
        throw new Error("Questa prenotazione non appartiene al tuo account");
      }

      if (data.id_status !== ReservationStatus.CONFIRMED) {
        throw new Error(
          "Solo le prenotazioni confermate possono essere pagate",
        );
      }

      setReservation(data);
      setPayStep("found");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Errore durante la ricerca";
      setPayError(msg);
      setPayStep("idle");
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet?.wallet_id || !amount) return;

    const amountNum = parseFloat(amount.replace(",", "."));
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayError("Inserisci un importo valido");
      return;
    }

    if (wallet.balance !== null && amountNum > wallet.balance) {
      setPayError("Saldo insufficiente");
      return;
    }

    setPayStep("paying");
    setPayError(null);

    try {
      const res = await fetch(`/api/wallets/${wallet.wallet_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: WalletUpdateType.SUBTRACT,
          amount: amountNum,
        }),
      });

      if (!res.ok) throw new Error("Errore durante il pagamento");

      setWallet((prev) =>
        prev ? { ...prev, balance: (prev.balance ?? 0) - amountNum } : prev,
      );
      setPayStep("done");
      toast.success("Pagamento effettuato");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Errore durante il pagamento";
      setPayError(msg);
      setPayStep("found");
    }
  }

  function reset() {
    setPayStep("idle");
    setReservation(null);
    setReservationId("");
    setAmount("");
    setPayError(null);
  }

  const formattedBalance =
    wallet?.balance !== null && wallet?.balance !== undefined
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2,
        }).format(wallet.balance)
      : null;

  const reservationDate = reservation?.date ? new Date(reservation.date) : null;
  const startLabel = reservation?.start_time
    ? new Date(reservation.start_time).toISOString().substring(11, 16)
    : null;
  const endLabel = reservation?.end_time
    ? new Date(reservation.end_time).toISOString().substring(11, 16)
    : null;

  const hasWallet =
    !loadingWallet && wallet !== null && wallet.wallet_id !== null;

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col gap-5 pb-6">
        {/* ── Balance hero — full-width horizontal band ────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.13 0.03 260) 0%, oklch(0.17 0.025 250) 45%, oklch(0.14 0.04 275) 100%)",
          }}
        >
          {/* Radial glows */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 10% 80%, oklch(0.48 0.18 155 / 0.14) 0%, transparent 50%), radial-gradient(ellipse at 90% 15%, oklch(0.38 0.1 280 / 0.09) 0%, transparent 45%)",
            }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Large € watermark */}
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 font-mono leading-none pointer-events-none select-none text-white"
            style={{ fontSize: "9rem", opacity: 0.03 }}
          >
            €
          </div>

          {/* Left: icon badge + balance */}
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/[0.07] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <Wallet className="w-3.5 h-3.5 text-white/70" />
              </div>
              <span className="text-[10px] font-bold text-white/40 tracking-[0.15em]">
                Portafoglio
              </span>
            </div>

            {loadingWallet ? (
              <BalanceSkeleton />
            ) : wallet === null || wallet.wallet_id === null ? (
              <p className="text-white/30 text-sm">
                Nessun portafoglio associato
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold text-white/35 tracking-[0.15em]">
                  Saldo disponibile
                </p>
                <p className="font-mono text-5xl font-black text-white tracking-tight leading-none">
                  {formattedBalance}
                </p>
              </div>
            )}
          </div>

          {/* Right: status + wallet ID */}
          {hasWallet && (
            <div className="relative flex flex-col items-start sm:items-end gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.12em]">
                  Attivo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Main grid: form + info ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 items-start">
          {/* ── Payment panel ──────────────────────────────────────────── */}
          <div className="rounded-2xl border bg-card flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b shrink-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.07]">
                <CreditCard className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm leading-tight">
                  Paga prenotazione
                </h2>
                <p className="text-xs text-muted-foreground">
                  Inserisci l&apos;ID della prenotazione da saldare
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              {!hasWallet && !loadingWallet ? (
                <NoWallet />
              ) : payStep === "done" ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">Pagamento completato</p>
                    <p className="text-sm text-muted-foreground">
                      Prenotazione #{reservation?.id} saldata con successo
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="mt-2"
                  >
                    Nuovo pagamento
                  </Button>
                </div>
              ) : (
                <>
                  {/* Step 1: ID search */}
                  <form onSubmit={handleSearch} className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Hash className="w-3 h-3" />
                      ID prenotazione
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        placeholder="es. 284"
                        value={reservationId}
                        onChange={(e) => {
                          setReservationId(e.target.value);
                          if (payStep === "found") reset();
                        }}
                        className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors font-mono"
                        disabled={
                          !hasWallet ||
                          payStep === "searching" ||
                          payStep === "paying"
                        }
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="icon"
                        className="shrink-0 transition-transform active:scale-95"
                        disabled={
                          !reservationId ||
                          payStep === "searching" ||
                          payStep === "paying"
                        }
                      >
                        {payStep === "searching" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Inline error */}
                  {payError && <InlineError message={payError} />}

                  {/* Step 2: reservation preview */}
                  {(payStep === "found" || payStep === "paying") &&
                    reservation && (
                      <div className="rounded-xl bg-muted/40 border border-border/50 p-4 flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">
                          Prenotazione trovata
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-sm">
                            #{reservation.id}
                          </span>
                          {reservation.room && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <DoorOpen className="w-3 h-3" />
                              {reservation.room}
                            </span>
                          )}
                        </div>
                        {reservationDate && (
                          <p className="text-xs text-muted-foreground">
                            {format(reservationDate, "EEEE d MMMM yyyy", {
                              locale: it,
                            })}
                          </p>
                        )}
                        {startLabel && endLabel && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="font-mono">
                              {startLabel} – {endLabel}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                  {/* Step 3: amount + pay */}
                  {(payStep === "found" || payStep === "paying") && (
                    <form onSubmit={handlePay} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Importo (€)
                        </Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="es. 15,00"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setPayError(null);
                          }}
                          className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors font-mono"
                          disabled={payStep === "paying"}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full gap-2 transition-transform active:scale-[0.98]"
                        disabled={!amount || payStep === "paying"}
                      >
                        {payStep === "paying" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Elaborazione...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Paga ora
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Info panel ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border bg-card p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.07]">
                <Info className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm leading-tight">
                  Come funziona
                </h2>
                <p className="text-xs text-muted-foreground">
                  Guida al pagamento
                </p>
              </div>
            </div>

            {/* Steps */}
            <ol className="flex flex-col">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={i} className="relative flex gap-4">
                  {/* Connector line */}
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute left-3 top-7 h-full w-px bg-border" />
                  )}
                  {/* Step number */}
                  <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  </div>
                  {/* Content */}
                  <div className={i < HOW_IT_WORKS.length - 1 ? "pb-5" : ""}>
                    <p className="font-semibold text-sm leading-snug">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Security note */}
            <div className="rounded-xl bg-muted/40 border border-border/50 p-4 flex gap-3 mt-auto">
              <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Solo le prenotazioni con stato{" "}
                <strong className="text-foreground font-semibold">
                  Confermata
                </strong>{" "}
                possono essere pagate tramite portafoglio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
