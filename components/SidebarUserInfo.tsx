"use client";
import { AppUser } from "@/types/types";
import { useSession } from "next-auth/react";
import { SidebarMenuButton } from "./ui/sidebar";

export default function SidebarUserInfo() {
  const { data: session } = useSession();
  const user = session?.user as AppUser | undefined;

  return (
    <SidebarMenuButton className="mt-2 h-fit" size={"lg"}>
      <div className="flex flex-col">
        <span className="font-semibold">
          {user?.name} {user?.surname}
        </span>
        <span className="text-gray-500 text-xs">@{user?.nickname}</span>
      </div>
    </SidebarMenuButton>
  );
}
