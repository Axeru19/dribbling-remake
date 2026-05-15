"use client";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteReservationButton({
  deleteReservation,
}: {
  deleteReservation: () => void;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash2 />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-5 pt-5 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            Eliminare la prenotazione?
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Questa azione non può essere annullata. La prenotazione verrà
            rimossa definitivamente dal sistema.
          </p>
        </div>
        <DrawerFooter className="px-5 pt-0 pb-8 gap-2">
          <DrawerClose asChild>
            <Button
              variant="destructive"
              size="lg"
              className="w-full h-12 gap-2 font-semibold active:scale-[0.98] transition-transform"
              onClick={deleteReservation}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Sì, elimina
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="w-full h-10 text-muted-foreground"
            >
              Annulla
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
