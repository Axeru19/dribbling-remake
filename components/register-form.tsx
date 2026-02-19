"use client";

/**
 * RegisterForm — form di registrazione utente.
 *
 * La logica (schema Zod, validazione, submit, redirect) è invariata.
 * Il layout è stato ridisegnato con:
 *  - Intestazione con titolo e sottotitolo
 *  - Sezioni visive: Informazioni personali / Accesso
 *  - Icone nei campi tramite wrapper
 *  - Feedback visivo inline (FormMessage da shadcn)
 *  - Submit button full-width con loading state
 *  - Link login in fondo
 */

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Phone,
  User,
  UserCircle2,
} from "lucide-react";

// ─── Schema di validazione ────────────────────────────────────────────────────

const formSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio"),
    surname: z.string().min(1, "Il cognome è obbligatorio"),
    // Numero di telefono: solo cifre, min 10 char (ammette prefissi internazionali)
    telephone: z
      .string()
      .min(10, "Il numero di telefono deve essere valido")
      .regex(/^\d+$/, "Il numero di telefono deve contenere solo numeri"),
    nickname: z.string().min(1, "Il nickname è obbligatorio"),
    email: z.string().email("Inserisci un'email valida"),
    password: z.string().min(1, "La password è obbligatoria"),
    confirmPassword: z
      .string()
      .min(1, "La conferma della password è obbligatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

// ─── Componente field con icona ───────────────────────────────────────────────

/**
 * Wrapper che aggiunge un'icona a sinistra dell'`<Input>` shadcn.
 * L'icona è puramente decorativa (aria-hidden).
 */
function FieldWithIcon({
  icon: Icon,
  children,
  rightSlot,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <div
        className={cn(
          "w-full",
          "[&_input]:pl-10",
          rightSlot && "[&_input]:pr-10",
        )}
      >
        {children}
      </div>
      {rightSlot && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      name: "",
      surname: "",
      nickname: "",
      confirmPassword: "",
      telephone: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    const { confirmPassword, ...submitData } = data;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        toast.success("Registrazione completata con successo!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2500);
      } else {
        if (res.status === 409) {
          form.setError("email", {
            type: "manual",
            message: "Email già registrata. Prova con un'altra email.",
          });
          return;
        }
        const errorData = await res.json();
        console.error("Error creating user:", errorData);
        toast.error("Errore durante la registrazione. Riprova più tardi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8 w-full"
      >
        {/* ── Intestazione ──────────────────────────────────────────────── */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Crea il tuo account
          </h1>
          <p className="text-sm text-muted-foreground">
            Compila i campi per accedere a tutti i servizi del centro sportivo.
          </p>
        </div>

        {/* ── Sezione 1: Informazioni personali ─────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <UserCircle2 className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Informazioni personali
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FieldWithIcon icon={User}>
                    <Input
                      type="text"
                      placeholder="Mario"
                      autoComplete="given-name"
                      {...field}
                    />
                  </FieldWithIcon>
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
                  <FormLabel>Cognome</FormLabel>
                  <FieldWithIcon icon={User}>
                    <Input
                      type="text"
                      placeholder="Rossi"
                      autoComplete="family-name"
                      {...field}
                    />
                  </FieldWithIcon>
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
                  <FormLabel>Nickname</FormLabel>
                  <FieldWithIcon icon={AtSign}>
                    <Input
                      type="text"
                      placeholder="mario_rossi"
                      autoComplete="username"
                      {...field}
                    />
                  </FieldWithIcon>
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
                  <FormLabel>Telefono</FormLabel>
                  <FieldWithIcon icon={Phone}>
                    <Input
                      type="tel"
                      placeholder="3201234567"
                      autoComplete="tel"
                      inputMode="numeric"
                      {...field}
                    />
                  </FieldWithIcon>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ── Sezione 2: Credenziali di accesso ─────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <KeyRound className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              Credenziali di accesso
            </span>
          </div>

          {/* Email — full width */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FieldWithIcon icon={AtSign}>
                  <Input
                    type="email"
                    placeholder="mario.rossi@email.com"
                    autoComplete="email"
                    {...field}
                  />
                </FieldWithIcon>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FieldWithIcon
                    icon={Lock}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword ? "Nascondi password" : "Mostra password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    }
                  >
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FieldWithIcon>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conferma password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conferma password</FormLabel>
                  <FieldWithIcon
                    icon={Lock}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showConfirm
                            ? "Nascondi conferma password"
                            : "Mostra conferma password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    }
                  >
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FieldWithIcon>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full h-10 font-semibold rounded-xl shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Registrazione in corso…
              </span>
            ) : (
              "Crea account"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <a
              href="/login"
              className="font-semibold text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Accedi
            </a>
          </p>
        </div>
      </form>
    </Form>
  );
}
