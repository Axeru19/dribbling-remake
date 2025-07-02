import React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import RegisterForm from "@/components/register-form";

export default function page() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md mr-2">
              <GalleryVerticalEnd className="size-4" />
            </div>
            C.S. Dribbling
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
