export const sectors = ["TI", "Financeiro", "RH", "Vendas", "Operações"] as const;
export const priorities = ["Baixa", "Média", "Alta"] as const;
export const statuses = ["Aberto", "Em Andamento", "Concluído"] as const;

export type Sector = (typeof sectors)[number];
export type Priority = (typeof priorities)[number];
export type TicketStatus = (typeof statuses)[number];

export interface Ticket {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  sector: Sector;
  priority: Priority;
  status: TicketStatus;
  createdAt: string;
}

export type CreateTicketInput = Omit<Ticket, "id" | "status" | "createdAt">;
