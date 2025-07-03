"use client";

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

const formSchema = z
  .object({
    name: z.string().min(1, "Il nome è obbligatorio"),
    surname: z.string().min(1, "Il cognome è obbligatorio"),
    // numero di telefono in cui controllo che sia un numero valido
    // e che sia lungo almeno 10 caratteri,
    // ma non imposto un massimo per permettere numeri internazionali
    telephone: z
      .string()
      .min(10, "Il numero di telefono deve essere valido")
      .regex(/^\d+$/, "Il numero di telefono deve contenere solo numeri"),
    nickname: z.string().min(1, "Il nickname è obbligatorio"),
    email: z.string().email("Inserisci un'email valida"),
    password: z.string().min(1, "La password è obbligatoria"),
    // controllo che la password sia uguale alla conferma
    confirmPassword: z
      .string()
      .min(1, "La conferma della password è obbligatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { confirmPassword, ...submitData } = data;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    });

    // contrrollo se la risposta è ok
    if (res.ok) {
      const responseData = await res.json();
      toast.success("Registrazione completata con successo!");
      // Redirect or show success message
      setTimeout(() => {
        window.location.href = "/login"; // Redirect to login page
      }, 2500);
    } else {
      // controllo se ho errore di email già esistente
      if (res.status === 409) {
        //inserisco errore nel form
        form.setError("email", {
          type: "manual",
          message: "Email già esistente. Prova con un'altra email.",
        });
        return;
      }
      const errorData = await res.json();
      console.error("Error creating user:", errorData);
      // Show error message to the user
      toast.error("Errore durante la registrazione. Riprova più tardi.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex h-full flex-col w-full gap-6")}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Registrati</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Inserisci tutti i campi obbligatori
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <Input
                  type="text"
                  placeholder="Inserisci il tuo nome"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cognome</FormLabel>
                <Input
                  type="text"
                  placeholder="Inserisci il tuo cognome"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname</FormLabel>
                <Input
                  type="text"
                  placeholder="Inserisci il tuo nickname"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <Input
                  type="text"
                  placeholder="Inserisci il tuo numero di telefono"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="lg:col-span-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="text"
                    placeholder="Inserisci la tua email"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Inserisci la password"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conferma Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Conferma la password"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="lg:col-span-2">
            Registrati
          </Button>
        </div>

        <div className="text-center text-sm">
          Hai già un account?{" "}
          <a href="/login" className="underline underline-offset-4">
            Accedi
          </a>
        </div>
      </form>
    </Form>
  );
}
