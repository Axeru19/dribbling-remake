import React from "react";
import { CalendarDays } from "lucide-react";
import RegisterForm from "@/components/register-form";

/**
 * Pagina di registrazione.
 *
 * Layout:
 *  - Mobile: card centrata con logo sopra
 *  - Desktop (lg+): due colonne — sinistra hero, destra form card
 */
export default function RegisterPage() {
  return (
    <div className="min-h-svh w-full flex">
      {/* ══ Colonna sinistra: hero (solo desktop) ══════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative bg-primary flex-col items-start justify-between p-12 overflow-hidden">
        {/* Pattern decorativo di sfondo */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        {/* Cerchio decorativo in alto a destra */}
        <div
          className="absolute -top-32 -right-32 size-[500px] rounded-full bg-white/5"
          aria-hidden="true"
        />
        {/* Cerchio decorativo in basso a sinistra */}
        <div
          className="absolute -bottom-24 -left-24 size-[380px] rounded-full bg-white/5"
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-xl bg-white/15 backdrop-blur-sm">
            <CalendarDays className="size-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            C.S. Dribbling
          </span>
        </div>

        {/* Copy centrale */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-white/80 text-xs font-semibold tracking-wider uppercase">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Nuova registrazione
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
            Benvenuto nel
            <br />
            <span className="text-white/70">tuo centro</span>
            <br />
            sportivo.
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Prenota i campi, gestisci le tue partite e tieni traccia dei tuoi
            pagamenti — tutto in un unico posto.
          </p>
        </div>

        {/* Footer hero */}
        <div className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} C.S. Dribbling
        </div>
      </div>

      {/* ══ Colonna destra: form ════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-background">
        {/* Logo mobile (solo < lg) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary">
            <CalendarDays className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">
            C.S. Dribbling
          </span>
        </div>

        {/* Card form */}
        <div className="w-full max-w-lg">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
