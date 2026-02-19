"use client";

import { AppUser } from "@/types/types";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  AtSign,
  Lock,
  KeyRound,
  ShieldCheck,
  Loader2,
  Save,
} from "lucide-react";

// ─── Validation Schema ────────────────────────────────────────────────────────

const formSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio"),
    surname: z.string().min(1, "Il cognome è obbligatorio"),
    // Numero di telefono: solo cifre, minimo 10 caratteri (ammette numeri internazionali)
    telephone: z
      .string()
      .min(10, "Il numero di telefono deve essere valido")
      .regex(/^\d+$/, "Il numero di telefono deve contenere solo numeri"),
    nickname: z.string().min(1, "Il nickname è obbligatorio"),
    email: z.string().email("Inserisci un'email valida"),
    password: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Le password non corrispondono",
    path: ["confirmNewPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

// ─── Helper: Avatar con iniziali ──────────────────────────────────────────────

/**
 * Restituisce le iniziali dell'utente (nome + cognome, max 2 caratteri).
 */
function getInitials(name?: string | null, surname?: string | null): string {
  const n = name?.charAt(0).toUpperCase() ?? "";
  const s = surname?.charAt(0).toUpperCase() ?? "";
  return `${n}${s}` || "?";
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="font-semibold text-base leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── LabeledField ─────────────────────────────────────────────────────────────

interface LabeledFieldProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

/**
 * Wrapper per ogni campo del form: mostra un'icona a sinistra dell'input.
 */
function LabeledField({ icon: Icon, label, children }: LabeledFieldProps) {
  return (
    <FormItem>
      <FormLabel className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
      </FormLabel>
      {children}
      <FormMessage />
    </FormItem>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfiloPage() {
  const { data: session, update } = useSession();
  const user = session?.user as AppUser | undefined;

  // Stati di caricamento separati per i due submit handler
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: user?.email ?? "",
      password: "",
      name: user?.name ?? "",
      surname: user?.surname ?? "",
      nickname: user?.nickname ?? "",
      telephone: user?.telephone ?? "",
    },
  });

  // Popola il form appena la sessione è disponibile (risolve il delay SSR/CSR)
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email ?? "",
        password: "",
        name: user.name ?? "",
        surname: user.surname ?? "",
        nickname: user.nickname ?? "",
        telephone: user.telephone ?? "",
      });
    }
  }, [user, form]);

  // ── Salvataggio dati personali ─────────────────────────────────────────────
  async function submitProfile(data: FormValues) {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          telephone: data.telephone,
          nickname: data.nickname,
          email: data.email,
        }),
      });

      if (!res.ok) {
        toast.error("Errore durante l'aggiornamento del profilo!");
        return;
      }

      toast.success("Profilo aggiornato con successo");

      // Aggiorna la sessione JWT in memoria per riflettere i nuovi dati
      // senza richiedere un re-login
      await update({
        name: data.name,
        surname: data.surname,
        telephone: data.telephone,
        nickname: data.nickname,
        email: data.email,
      });
    } finally {
      setSavingProfile(false);
    }
  }

  // ── Cambio password ────────────────────────────────────────────────────────
  async function handleChangePassword() {
    const password = form.getValues("password");
    const newPassword = form.getValues("newPassword");
    const confirmNewPassword = form.getValues("confirmNewPassword");

    // Validazione: tutti i campi password devono essere compilati
    if (!password || !newPassword || !confirmNewPassword) {
      toast.error("Compila tutti i campi per cambiare la password");
      return;
    }

    // Validazione: le due nuove password devono coincidere
    if (newPassword !== confirmNewPassword) {
      toast.error("Le nuove password non corrispondono");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${user?.id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error ?? "Errore durante il cambio password");
        return;
      }

      toast.success("Password aggiornata con successo");

      // Reset dei soli campi password dopo il successo
      form.setValue("password", "");
      form.setValue("newPassword", "");
      form.setValue("confirmNewPassword", "");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 px-1">
        {/* ── Hero del profilo ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 pt-2 pb-4 border-b">
          {/* Avatar con iniziali */}
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg ring-4 ring-primary/20">
            <span className="text-2xl font-bold text-primary-foreground select-none">
              {getInitials(user?.name, user?.surname)}
            </span>
          </div>

          {/* Nome e nickname */}
          <div className="flex flex-col items-center sm:items-start gap-0.5 min-w-0">
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              {user?.name} {user?.surname}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              @{user?.nickname}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            Form unico: i due submit handler sono collegati a bottoni distinti
            all'interno dello stesso <form>, così react-hook-form mantiene
            il controllo su tutti i campi simultaneamente.
        ──────────────────────────────────────────────────────────────────── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitProfile)}
            className="flex flex-col gap-6"
          >
            {/* ── Card: Dati personali ────────────────────────────────────── */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                <SectionHeader
                  icon={User}
                  title="Dati personali"
                  description="Informazioni visibili agli altri utenti"
                />
              </CardHeader>
              <CardContent className="px-4 sm:px-5 pb-5 flex flex-col gap-4">
                {/* Nome e Cognome sulla stessa riga */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <LabeledField icon={User} label="Nome">
                        <Input
                          type="text"
                          placeholder="Il tuo nome"
                          className="bg-accent/30 focus:bg-background transition-colors"
                          {...field}
                        />
                      </LabeledField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                      <LabeledField icon={User} label="Cognome">
                        <Input
                          type="text"
                          placeholder="Il tuo cognome"
                          className="bg-accent/30 focus:bg-background transition-colors"
                          {...field}
                        />
                      </LabeledField>
                    )}
                  />
                </div>

                {/* Email — riga intera */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <LabeledField icon={Mail} label="Email">
                      <Input
                        type="email"
                        placeholder="La tua email"
                        className="bg-accent/30 focus:bg-background transition-colors"
                        {...field}
                      />
                    </LabeledField>
                  )}
                />

                {/* Nickname e Telefono sulla stessa riga */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <LabeledField icon={AtSign} label="Nickname">
                        <Input
                          type="text"
                          placeholder="Il tuo nickname"
                          className="bg-accent/30 focus:bg-background transition-colors"
                          {...field}
                        />
                      </LabeledField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <LabeledField icon={Phone} label="Telefono">
                        <Input
                          type="tel"
                          placeholder="Il tuo numero"
                          className="bg-accent/30 focus:bg-background transition-colors"
                          {...field}
                        />
                      </LabeledField>
                    )}
                  />
                </div>

                <Separator />

                {/* Pulsante salvataggio dati personali */}
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full sm:self-end gap-2 font-semibold"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="w-full" />
                      Salva modifiche
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* ── Card: Sicurezza / Cambio password ───────────────────────── */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                <SectionHeader
                  icon={ShieldCheck}
                  title="Sicurezza"
                  description="Gestisci la tua password di accesso"
                />
              </CardHeader>
              <CardContent className="px-4 sm:px-5 pb-5 flex flex-col gap-4">
                {/* Vecchia password — riga intera */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <LabeledField icon={Lock} label="Password attuale">
                      <Input
                        type="password"
                        placeholder="La password attuale"
                        className="bg-accent/30 focus:bg-background transition-colors"
                        {...field}
                      />
                    </LabeledField>
                  )}
                />

                {/* Nuova password e conferma sulla stessa riga */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <LabeledField icon={KeyRound} label="Nuova password">
                        <Input
                          type="password"
                          placeholder="Nuova password"
                          className="bg-accent/30 focus:bg-background transition-colors"
                          {...field}
                        />
                      </LabeledField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <LabeledField icon={KeyRound} label="Conferma password">
                        <Input
                          type="password"
                          placeholder="Ripeti la nuova password"
                          className="bg-accent/30 focus:bg-background transition-colors"
                          {...field}
                        />
                      </LabeledField>
                    )}
                  />
                </div>

                <Separator />

                {/* Pulsante cambio password — type="button" per non triggerare submitProfile */}
                <Button
                  type="button"
                  variant="secondary"
                  disabled={savingPassword}
                  onClick={handleChangePassword}
                  className="w-full gap-2 font-semibold"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aggiornamento...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Cambia password
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
