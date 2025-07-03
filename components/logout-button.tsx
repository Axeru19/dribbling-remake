"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
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
import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function LogoutButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <SidebarMenuButton className="cursor-pointer" size={"lg"}>
          <LogOut size={16} />
          <span>Logout</span>
        </SidebarMenuButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Sicuro di voler eseguire il logout?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se esegui il logout, dovrai effettuare nuovamente l'accesso per
            continuare a utilizzare il sito.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={() => signOut({ callbackUrl: "/login" })}>
            Si, va bene
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
