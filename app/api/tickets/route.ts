import { NextResponse } from "next/server";
import { readTickets, writeTickets } from "@/lib/server-tickets";
import { Ticket } from "@/lib/tickets";

export async function GET() {
  return NextResponse.json(await readTickets());
}

export async function POST(request: Request) {
  const body = await request.json();
  const tickets = await readTickets();
  const ticket: Ticket = {
    ...body,
    id: `NX-${Date.now().toString().slice(-6)}`,
    status: "Aberto",
    createdAt: new Date().toISOString(),
  };
  await writeTickets([ticket, ...tickets]);
  return NextResponse.json(ticket, { status: 201 });
}
