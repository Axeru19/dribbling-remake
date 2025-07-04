"use client";

import { AppUser } from "@/types/types";
import React from "react";
import {
  DialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  surname: z.string().min(1, "Il cognome è obbligatorio"),
  telephone: z
    .string()
    .min(10, "Il numero di telefono deve essere valido")
    .regex(/^\d+$/, "Il numero di telefono deve contenere solo numeri"),
  nickname: z.string().min(1, "Il nickname è obbligatorio"),
  email: z.string().email("Inserisci un'email valida"),
  password: z.string(),
});

export default function UserDialog({
  user,
  dialogOpen,
  setDialogOpen,
  setReload,
}: {
  user: AppUser;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  setReload: (value: number | ((prev: number) => number)) => void; // Function to trigger a reload
}) {
  if (!dialogOpen) {
    return; // Render nothing if no user is provided
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Handle form submission logic here
    fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Errore durante l'aggiornamento dell'utente");
        }
        return response.json();
      })
      .then((data) => {
        toast.success("Utente aggiornato con successo!");
        setDialogOpen(false);
        setReload((prev: number) => prev + 1); // Trigger a reload
      })
      .catch((error) => {
        toast.error(
          "Si è verificato un errore durante l'aggiornamento dell'utente."
        );
        // You can show an error message to the user here
      });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name!,
      surname: user.surname!,
      telephone: user.telephone!,
      nickname: user.nickname!,
      email: user.email!,
      password: "", // Password should not be pre-filled for security reasons
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            <span>{user?.name + " " + user?.surname}</span>
          </DialogTitle>
          <DialogDescription>
            In questa sezione puoi visualizzare e modificare i dettagli
            dell'utente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6 p-2 overflow-y-auto h-full max-h-[40vh]"
          >
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

            <span className="p-2 bg-warning rounded-md text-white text-xs lg:col-span-2 text-center">
              La password non verrà mostrata per motivi di sicurezza. Se
              desideri cambiarla, inserisci una nuova password qui sotto.
            </span>

            <div className="lg:col-span-2">
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
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Chiudi</Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
