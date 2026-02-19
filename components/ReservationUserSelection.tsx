import { users, users_wallets } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function ReservationUserSelection({
  user,
  setUser,
}: {
  user: users_wallets | null;
  setUser: (user: users_wallets | null) => void;
}) {
  const [userSearch, setUserSearch] = useState<string>("");
  const [userList, setUserList] = useState<users_wallets[] | null>(null);

  // add debounce to user search
  useEffect(() => {
    if (!userSearch || userSearch == "") return;
    const timeout = setTimeout(() => {
      // fetch user by search
      fetch("/api/users/list", {
        method: "POST",
        body: JSON.stringify({ filter: userSearch }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => {
          setUserList(data);
        })
        .catch(() => {
          toast.error("Errore durante il caricamento degli utenti.");
        });
    }, 500);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  /**
   * Insert reservation with selected user
   */
  function insertReservation() {
    const userSelected: string | number =
      userSearch.length > 0 && userList && userList.length === 0
        ? userSearch
        : user?.user_id
          ? Number(user!.user_id)
          : 0;

    fetch("/api/reservations/insert", {
      method: "POST",
      body: JSON.stringify({ user: userSelected }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        toast.success("Prenotazione inserita con successo.");
        window.location.href = "/dashboard/partite/" + data.id;
      })
      .catch(() => {
        toast.error("Errore durante l'inserimento della prenotazione.");
      });
  }

  return (
    <div className="flex justify-center items-center w-full flex-col gap-2">
      <h1 className="text-xl font-bold">Utente prenotazione</h1>
      <Input
        className="lg:w-1/2"
        onChange={(e) => {
          setUserSearch(e.target.value);
        }}
        placeholder="Cerca un utente..."
      />

      {userSearch.length > 0 && userList && userList.length === 0 && (
        <Button className="w-1/2 mt-2" onClick={insertReservation}>
          Inserisci prenotazione con utente non registrato
        </Button>
      )}

      {userList && userList.length > 0 && user && (
        <Button className="w-1/2 mt-2" onClick={insertReservation}>
          Inserisci prenotazione
        </Button>
      )}

      <div className="flex mt-3 w-full items-center flex-col gap-2">
        {userList?.map((u) => (
          <div
            key={u.user_id}
            className={cn(
              "text-sm w-full md:w-1/2 border cursor-pointer hover:bg-gray-200 text-center rounded-md p-3",
              Number(u.user_id) === Number(user?.user_id) ? "bg-gray-200" : "",
            )}
            onClick={() => setUser(u)}
          >
            {u.name} {u.surname}{" "}
            <span className="text-gray-400">@{u.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
