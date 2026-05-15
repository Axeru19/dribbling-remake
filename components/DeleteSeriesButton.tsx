"use client";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Repeat2, Trash2 } from "lucide-react";

export default function DeleteSeriesButton({
  deleteSeries,
}: {
  deleteSeries: () => void;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/60"
        >
          <Repeat2 />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-5 pt-5 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Repeat2 className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            Eliminare tutta la serie?
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Verranno rimosse tutte le prenotazioni di questa serie fissa
            settimanale. L&apos;azione non può essere annullata.
          </p>
        </div>
        <DrawerFooter className="px-5 pt-0 pb-8 gap-2">
          <DrawerClose asChild>
            <Button
              variant="destructive"
              size="lg"
              className="w-full h-12 gap-2 font-semibold active:scale-[0.98] transition-transform"
              onClick={deleteSeries}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Sì, elimina serie
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
