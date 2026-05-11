"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Repeat2 } from "lucide-react";

export default function DeleteSeriesButton({
  deleteSeries,
}: {
  deleteSeries: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="outline" className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/60">
          <Repeat2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminare tutta la serie fissa?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Questa azione eliminerà tutte le prenotazioni appartenenti a questa serie fissa settimanale. Non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive"
            onClick={deleteSeries}
          >
            Sì, elimina serie
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
