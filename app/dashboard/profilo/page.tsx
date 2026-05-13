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
import { Badge } from "@/components/ui/badge";
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

function getInitials(name?: string | null, surname?: string | null): string {
  const n = name?.charAt(0).toUpperCase() ?? "";
  const s = surname?.charAt(0).toUpperCase() ?? "";
  return `${n}${s}` || "?";
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

interface FieldRowProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

function FieldRow({ icon: Icon, label, children }: FieldRowProps) {
  return (
    <FormItem>
      <FormLabel className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
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
        toast.error("Errore durante l'aggiornamento del profilo");
        return;
      }

      toast.success("Profilo aggiornato");

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

  async function handleChangePassword() {
    const password = form.getValues("password");
    const newPassword = form.getValues("newPassword");
    const confirmNewPassword = form.getValues("confirmNewPassword");

    if (!password || !newPassword || !confirmNewPassword) {
      toast.error("Compila tutti i campi per cambiare la password");
      return;
    }

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

      toast.success("Password aggiornata");

      form.setValue("password", "");
      form.setValue("newPassword", "");
      form.setValue("confirmNewPassword", "");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Banner */}
          <div
            className="h-36 sm:h-44 rounded-2xl overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.13 0.03 260) 0%, oklch(0.17 0.025 250) 45%, oklch(0.14 0.04 275) 100%)",
            }}
          >
            {/* Radial glow accents */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 18% 55%, oklch(0.4 0.14 260 / 0.28) 0%, transparent 52%), radial-gradient(ellipse at 82% 25%, oklch(0.35 0.1 280 / 0.18) 0%, transparent 45%)",
              }}
            />
            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
          </div>

          {/* Avatar — overlaps banner bottom edge */}
          <div className="absolute bottom-0 translate-y-1/2 left-5 sm:left-7">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-foreground flex items-center justify-center ring-[3px] ring-background shadow-2xl">
              <span className="text-2xl sm:text-3xl font-bold text-background select-none tracking-tight">
                {getInitials(user?.name, user?.surname)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Profile identity ──────────────────────────────────────────────── */}
        <div className="pt-10 sm:pt-12 px-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight leading-none">
                {user?.name} {user?.surname}
              </h1>
              <Badge
                variant="secondary"
                className="text-xs font-semibold shrink-0"
              >
                {user?.role_id === 2 ? "Admin" : "Utente"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5" />
                {user?.nickname}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Forms ─────────────────────────────────────────────────────────── */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitProfile)}
            className="flex flex-col gap-5"
          >
            {/* Two-column grid on lg+ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
              {/* ── Dati personali ─────────────────────────────────────────── */}
              <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.07]">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm leading-tight">
                      Dati personali
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Informazioni visibili agli altri utenti
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FieldRow icon={User} label="Nome">
                          <Input
                            type="text"
                            className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                            {...field}
                          />
                        </FieldRow>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="surname"
                      render={({ field }) => (
                        <FieldRow icon={User} label="Cognome">
                          <Input
                            type="text"
                            className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                            {...field}
                          />
                        </FieldRow>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FieldRow icon={Mail} label="Email">
                        <Input
                          type="email"
                          className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                          {...field}
                        />
                      </FieldRow>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FieldRow icon={AtSign} label="Nickname">
                          <Input
                            type="text"
                            className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                            {...field}
                          />
                        </FieldRow>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FieldRow icon={Phone} label="Telefono">
                          <Input
                            type="tel"
                            className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                            {...field}
                          />
                        </FieldRow>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full gap-2 font-semibold mt-1"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salva modifiche
                    </>
                  )}
                </Button>
              </section>

              {/* ── Sicurezza ──────────────────────────────────────────────── */}
              <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.07]">
                    <ShieldCheck className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm leading-tight">
                      Sicurezza
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Gestisci la tua password
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FieldRow icon={Lock} label="Password attuale">
                        <Input
                          type="password"
                          className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                          {...field}
                        />
                      </FieldRow>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FieldRow icon={KeyRound} label="Nuova password">
                        <Input
                          type="password"
                          className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                          {...field}
                        />
                      </FieldRow>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FieldRow icon={KeyRound} label="Conferma password">
                        <Input
                          type="password"
                          className="bg-muted/40 border-transparent focus:border-input focus:bg-background transition-colors"
                          {...field}
                        />
                      </FieldRow>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={savingPassword}
                  onClick={handleChangePassword}
                  className="w-full gap-2 font-semibold mt-1"
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
              </section>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
