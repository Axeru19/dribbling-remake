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
import { AppUser } from "@/types/types";
import { Mail, Smartphone, UserPen } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filter, setFilter] = useState<string>("");

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
  }, [filter]);

  return (
    <div className="flex flex-col gap-6">
      <Input className="lg:w-1/3 bg-gray-100" placeholder="Cerca utente..." />

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-4">
        {users.map((user) => (
          <Utente key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

function Utente({ user }: { user: AppUser }) {
  return (
    <Link href={`/dashboard/utenti/${user.id}`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{user.name + " " + user.surname}</CardTitle>
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
    </Link>
  );
}
