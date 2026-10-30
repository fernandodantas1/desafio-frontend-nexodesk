import { promises as fs } from "fs";
import path from "path";
import { seedTickets } from "./seed";
import { Ticket } from "./tickets";

const dataFile = path.join(process.cwd(), "data", "tickets.json");

export async function readTickets(): Promise<Ticket[]> {
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8")) as Ticket[];
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(seedTickets, null, 2));
    return seedTickets;
  }
}

export async function writeTickets(tickets: Ticket[]) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(tickets, null, 2));
}
