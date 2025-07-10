"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import UserDialog from "@/components/user-dialog";
import { AppUser } from "@/types/types";
import { users_wallets } from "@prisma/client";
import { set } from "date-fns";
import { Mail, Smartphone, UserPen } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [users, setUsers] = useState<users_wallets[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [userSelected, setUserSelected] = useState<users_wallets | null>(null);
  const [reload, setReload] = useState<number>(0);

  //aggiungo  debounce per filtro
  useEffect(() => {
    const handler = setTimeout(() => {
      fetch("/api/users/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filter }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Errore durante il recupero degli utenti");
          }
          return response.json();
        })
        .then((data) => {
          setUsers(data);
        })
        .catch((error) => {
          console.error("Errore durante il recupero degli utenti:", error);
          toast.error(
            "Si è verificato un errore durante il recupero degli utenti."
          );
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [filter, reload]);

  return (
    <div className="flex flex-col h-full gap-6">
      <Input className="lg:w-1/3 bg-gray-100" placeholder="Cerca utente..." />

      <div
        className="overflow-y-auto gap-4
         flex flex-col lg:grid lg:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]"
      >
        {users.map((user) => (
          <Utente
            setDialogOpen={setDialogOpen}
            key={user.user_id}
            user={user}
            setUserSelected={setUserSelected}
          />
        ))}
      </div>

      <UserDialog
        user={userSelected!}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        setReload={setReload}
      />
    </div>
  );
}

function Utente({
  user,
  setDialogOpen,
  setUserSelected,
}: {
  user: users_wallets;
  setDialogOpen: (open: boolean) => void;
  setUserSelected: (user: users_wallets) => void;
}) {
  return (
    <Card
      className="w-full h-fit"
      onClick={() => {
        setUserSelected(user);
        setDialogOpen(true);
      }}
    >
      <CardHeader>
        <CardTitle>
          {user.name + " " + user.surname}
          {" - "}
          <span className="text-gray-400">
            {new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: "EUR",
            }).format(user.balance || 0)}
          </span>
        </CardTitle>
        <CardDescription>@{user.nickname}</CardDescription>

        <CardAction>
          <UserPen size={20} />
        </CardAction>
      </CardHeader>

      <CardContent className="-mt-3">
        <div className="grid w-full gap-2 grid-cols-2">
          <span className="flex items-center gap-2">
            <Mail size={16} />{" "}
            <span className="truncate text-sm">{user.email}</span>
          </span>

          <span className="flex items-center gap-2">
            <Smartphone size={16} />{" "}
            <span className="text-sm">{user.telephone}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
