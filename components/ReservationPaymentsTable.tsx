import { reservations } from "@prisma/client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReservationPaymentsTable({
  reservation,
}: {
  reservation?: reservations;
}) {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Importo</TableHead>
            <TableHead>Metodo di pagamento</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </div>
  );
}
