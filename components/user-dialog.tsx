"use client";

/**
 * UserDialog
 *
 * Dialog per la visualizzazione e modifica di tutti i dati di un utente.
 * Si articola in tre sezioni:
 *   1. Portafoglio — saldo attuale + input ricarica
 *   2. Profilo     — campi anagrafici (nome, cognome, nickname, telefono, email)
 *   3. Sicurezza   — cambio password con banner avviso
 *
 * La logica di submit, ricarica wallet e gestione errori è invariata.
 */

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { users_wallets } from "@prisma/client";
import { WalletUpdateType } from "@/lib/enums";
import {
  ArrowUpCircle,
  KeyRound,
  Save,
  ShieldAlert,
  Wallet,
} from "lucide-react";

// ─── Schema validazione ────────────────────────────────────────────────────
const formSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  surname: z.string().min(1, "Il cognome è obbligatorio"),
  telephone: z
    .string()
    .min(10, "Il numero di telefono deve essere valido")
    .regex(/^\d+$/, "Solo numeri"),
  nickname: z.string().min(1, "Il nickname è obbligatorio"),
  email: z.string().email("Inserisci un'email valida"),
  password: z.string(),
  topUpAmount: z
    .number({ message: "Inserisci un importo valido" })
    .min(0, "Importo non valido")
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Hue deterministico da stringa */
function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getInitials(name?: string | null, surname?: string | null): string {
  return ((name?.[0] ?? "") + (surname?.[0] ?? "")).toUpperCase() || "?";
}

const formatEUR = (v: number | null | undefined) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    v ?? 0,
  );

// ─── Props ─────────────────────────────────────────────────────────────────

interface UserDialogProps {
  user: users_wallets;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  setReload: (value: number | ((prev: number) => number)) => void;
}

// ─── Componente ────────────────────────────────────────────────────────────

export default function UserDialog({
  user,
  dialogOpen,
  setDialogOpen,
  setReload,
}: UserDialogProps) {
  // Il dialog non viene renderizzato se chiuso (performance)
  if (!dialogOpen) return null;

  // ── Handlers — logica invariata ─────────────────────────────────────────

  function onSubmit(data: FormValues) {
    const { topUpAmount, ...userData } = data;

    fetch(`/api/users/${user.user_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        toast.success("Utente aggiornato con successo!");
        setDialogOpen(false);
        setReload((prev) => prev + 1);
      })
      .catch(() => toast.error("Errore durante l'aggiornamento dell'utente."));
  }

  function onWalletTopUp(data: FormValues) {
    fetch(`/api/wallets/${user.wallet_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: WalletUpdateType.ADD,
        amount: data.topUpAmount ?? 0,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        toast.success("Portafoglio ricaricato con successo!");
        setDialogOpen(false);
        setReload((prev) => prev + 1);
      })
      .catch(() => toast.error("Errore durante la ricarica del portafoglio."));
  }

  // ── Form ────────────────────────────────────────────────────────────────

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name ?? "",
      surname: user.surname ?? "",
      telephone: user.telephone ?? "",
      nickname: user.nickname ?? "",
      email: user.email ?? "",
      password: "",
    },
  });

  // Avatar colors
  const hue = stringToHue(`${user.name ?? ""}${user.surname ?? ""}`);
  const avatarBg = `hsl(${hue}, 55%, 92%)`;
  const avatarFg = `hsl(${hue}, 50%, 32%)`;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* ── Hero header ──────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Avatar grande */}
            <div
              className="flex items-center justify-center size-14 rounded-2xl text-xl font-bold shrink-0 shadow-sm ring-2 ring-background"
              style={{ backgroundColor: avatarBg, color: avatarFg }}
            >
              {getInitials(user.name, user.surname)}
            </div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold leading-tight truncate">
                {user.name} {user.surname}
              </DialogTitle>
              {user.nickname && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  @{user.nickname}
                </p>
              )}
            </div>
          </div>
          <DialogDescription className="sr-only">
            Modifica i dati del profilo e il saldo del portafoglio.
          </DialogDescription>
        </DialogHeader>

        {/* ── Corpo scrollabile ─────────────────────────────────────────── */}
        <div className="overflow-y-auto max-h-[65vh]">
          <Form {...form}>
            <form
              id="user-edit-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-0"
            >
              {/* ── Sezione 1: Portafoglio ─────────────────────────────── */}
              <section className="px-6 py-5 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Portafoglio
                  </h3>
                  {/* Saldo corrente */}
                  <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {formatEUR(user.balance)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="topUpAmount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Input
                          type="number"
                          placeholder="Importo da ricaricare (€)"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="default"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    onClick={() => form.handleSubmit(onWalletTopUp)()}
                  >
                    <ArrowUpCircle className="size-4" />
                    Ricarica
                  </Button>
                </div>
              </section>

              {/* Divider sezione */}
              <div className="border-t border-border" />

              {/* ── Sezione 2: Profilo ────────────────────────────────── */}
              <section className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-1.5 rounded-full bg-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Dati profilo
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nome</FormLabel>
                        <Input placeholder="Nome" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cognome */}
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Cognome</FormLabel>
                        <Input placeholder="Cognome" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nickname */}
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Nickname</FormLabel>
                        <Input placeholder="@nickname" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Telefono */}
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Telefono</FormLabel>
                        <Input placeholder="Numero" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email — full width */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs">Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="email@esempio.com"
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Divider sezione */}
              <div className="border-t border-border" />

              {/* ── Sezione 3: Sicurezza ─────────────────────────────── */}
              <section className="px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Sicurezza
                  </h3>
                </div>

                {/* Banner avviso password */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-4 py-3 mb-4">
                  <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    La password non è mostrata per sicurezza. Compila il campo
                    solo se desideri cambiarla.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nuova password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Lascia vuoto per non modificare"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>
            </form>
          </Form>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
          <DialogClose asChild>
            <Button variant="outline" className="sm:mr-auto">
              Chiudi
            </Button>
          </DialogClose>
          <Button type="submit" form="user-edit-form" className="gap-2">
            <Save className="size-4" />
            Salva modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
