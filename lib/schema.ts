import { z } from "zod";
import { priorities, sectors } from "./tickets";

export const ticketSchema = z.object({
  title: z.string().trim().min(5, "O título deve ter pelo menos 5 caracteres."),
  description: z.string().trim().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  requesterName: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres."),
  requesterEmail: z.string().trim().email("Informe um e-mail válido."),
  sector: z.enum(sectors, { error: "Selecione um setor." }),
  priority: z.enum(priorities, { error: "Selecione uma prioridade." }),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
