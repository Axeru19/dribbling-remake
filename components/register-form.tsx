import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form
      className={cn("flex h-full flex-col w-full gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Registrati</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Inserisci tutti i campi obbligatori
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Nome</Label>
          <Input id="nome" type="text" placeholder="Mario" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Cognome</Label>
          <Input id="cognome" type="text" placeholder="Rossi" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Data di nascita</Label>
          <Input id="birth_date" type="date" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Telefono</Label>
          <Input
            id="telephone"
            type="tel"
            placeholder="+39 3338883338"
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Nickname</Label>
          <Input id="nickname" type="text" placeholder="nick123" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Conferma Password</Label>
          <Input id="password" type="password" required />
        </div>

        <Button type="submit" className="lg:col-span-2">
          Registrati
        </Button>
      </div>

      <div className="text-center text-sm">
        Hai già un account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Accedi
        </a>
      </div>
    </form>
  );
}
