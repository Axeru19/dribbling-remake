"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fields } from "@prisma/client";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function page() {
  const [fields, setFields] = useState<fields[]>([]);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    fetch("/api/fields/list")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((data) => {
        setFields(data);
      })
      .catch(() => {
        toast.error("Errore durante il caricamento dei campi: ");
      });
  }, [reload]);

  return (
    <div className="w-full flex flex-col gap-6">
      <Button disabled className="w-fit">
        {" "}
        <Plus /> Aggiungi campo
      </Button>

      <div className="lg:flex-row flex-col flex gap-6">
        {fields
          .sort((a, b) => a.id - b.id)
          .map((field) => (
            <Field key={field.id} field={field} setReload={setReload} />
          ))}
      </div>
    </div>
  );
}

function Field({
  field,
  setReload,
}: {
  field: fields;
  setReload?: React.Dispatch<React.SetStateAction<number>>;
}) {
  function toggleFieldStatus() {
    fetch(`/api/fields/${field.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(field.status),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        toast.success("Campo aggiornato con successo");
        if (setReload) {
          setReload((prev) => prev + 1);
        }
      })
      .catch(() => {
        toast.error("Errore durante l'aggiornamento del campo");
      });
  }

  return (
    <Card
      onClick={toggleFieldStatus}
      className={cn(
        "flex-1",
        field.status ? "opacity-100" : "opacity-50",
        "cursor-pointer"
      )}
    >
      <CardHeader>
        <CardTitle>{field.description}</CardTitle>

        <CardDescription>
          {field.status &&
            "Questo campo è attivo, sarà visibile agli utenti. Sarà possibile prenotarlo."}

          {!field.status &&
            "Questo campo è disattivo, non sarà visibile agli utenti. Non sarà possibile prenotarlo."}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          variant="secondary"
          className={cn(
            "w-full cursor-pointer",
            field.status ? "bg-green-100" : "bg-red-100"
          )}
          onClick={toggleFieldStatus}
        >
          {field.status ? "Attivo" : "Disattivo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
