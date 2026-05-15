"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full gap-2 cursor-pointer">
          <LogOut size={16} />
          Logout
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-5 pt-5 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <LogOut className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            Eseguire il logout?
          </h2>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Dovrai effettuare nuovamente l&apos;accesso per continuare a
            utilizzare il sito.
          </p>
        </div>
        <DrawerFooter className="px-5 pt-0 pb-8 gap-2">
          <DrawerClose asChild>
            <Button
              size="lg"
              className="w-full h-12 gap-2 font-semibold active:scale-[0.98] transition-transform"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sì, esci
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
