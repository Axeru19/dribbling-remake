"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
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

const formSchema = z.object({
  email: z
    .string()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un'email valida"),
  password: z.string().min(1, "La password è obbligatoria"),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.ok) {
      toast.success("Login effettuato con successo!");
      // Login riuscito → puoi fare un redirect
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500); // Redirect to dashboard after 1 second
    } else {
      // Login fallito → mostra messaggio di errore
      toast.error("Credenziali non valide. Riprova.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6")}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Bentornato</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Inserisci mail e password per accedere
          </p>
        </div>

        <div className="grid gap-6">
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex justify-between">
                  Password{" "}
                  <a href="#" className="text-xs font-normal hover:underline">
                    Password dimenticata?
                  </a>
                </FormLabel>
                <Input
                  type="password"
                  placeholder="Inserisci la password"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Login
          </Button>
        </div>

        <div className="text-center text-sm">
          Non hai un account?{" "}
          <a href="/register" className="underline underline-offset-4">
            Registrati
          </a>
        </div>
      </form>
    </Form>
  );
}
