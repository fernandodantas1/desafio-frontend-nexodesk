import { NextRequest, NextResponse } from "next/server";
import { readTickets, writeTickets } from "@/lib/server-tickets";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  void request;
  const { id } = await params;
  const ticket = (await readTickets()).find((item) => item.id === id);
  return ticket ? NextResponse.json(ticket) : NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const tickets = await readTickets();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index === -1) return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
  tickets[index] = { ...tickets[index], ...body };
  await writeTickets(tickets);
  return NextResponse.json(tickets[index]);
}

export async function DELETE(request: Request, { params }: Params) {
  void request;
  const { id } = await params;
  const tickets = await readTickets();
  if (!tickets.some((ticket) => ticket.id === id)) {
    return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
  }
  await writeTickets(tickets.filter((ticket) => ticket.id !== id));
  return new NextResponse(null, { status: 204 });
}
