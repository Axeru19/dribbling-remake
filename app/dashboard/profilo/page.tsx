"use client";
import { AppUser } from "@/types/types";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
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
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    password: z.string(),
    newPassword: z.string(),
    // controllo che la password sia uguale alla conferma
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

export default function Page() {
  const user = useSession().data?.user as AppUser;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: user?.email || "",
      password: "",
      name: user?.name || "",
      surname: user?.surname || "",
      nickname: user?.nickname || "",
      telephone: user?.telephone || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",
        password: "",
        name: user.name || "",
        surname: user.surname || "",
        nickname: user.nickname || "",
        telephone: user.telephone || "",
      });
    }
  }, [user, form]);

  return (
    <div className="w-full h-full flex justify-center overflow-y-auto">
      <div className="w-full md:w-2/3 h-fit md:rounded-lg md:shadow flex flex-col md:border  md:p-6">
        <header className=" mb-4 flex flex-col text-center md:text-left">
          <span className="text-2xl flex items-center justify-center md:justify-start font-bold">
            <User size={24} className="mr-1" />
            {user?.name} {user?.surname}
          </span>
          <span className="text-xl font-semibold text-gray-500">
            @{user?.nickname}
          </span>
        </header>

        <Form {...form}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="md:col-span-2">
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

            <Button className="md:col-span-2">Salva</Button>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vecchia Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Inserisci vecchia password"
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuova Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Inserisci nuova password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conferma Nuova Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Conferma nuova password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="md:col-span-2" variant={"secondary"}>
              Cambia password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
