import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dashboard } from "./dashboard";

const tickets = [
  {
    id: "NX-1",
    title: "Computador reiniciando",
    description: "O equipamento reinicia inesperadamente durante o trabalho.",
    requesterName: "Marina Costa",
    requesterEmail: "marina@nexodesk.com",
    sector: "TI",
    priority: "Alta",
    status: "Aberto",
    createdAt: "2026-10-29T13:20:00.000Z",
  },
  {
    id: "NX-2",
    title: "Acesso ao sistema financeiro",
    description: "Solicito acesso ao módulo de despesas da empresa.",
    requesterName: "Carlos Mendes",
    requesterEmail: "carlos@nexodesk.com",
    sector: "Financeiro",
    priority: "Média",
    status: "Concluído",
    createdAt: "2026-10-28T13:20:00.000Z",
  },
];

describe("Dashboard", () => {
  it("filtra chamados por texto com debounce", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => tickets,
    }));
    render(<Dashboard />);

    await screen.findByText("Computador reiniciando");
    fireEvent.change(screen.getByLabelText("Buscar chamado"), { target: { value: "financeiro" } });
    await waitFor(() => expect(screen.queryByText("Computador reiniciando")).not.toBeInTheDocument(), { timeout: 1000 });
    expect(screen.getByText("Acesso ao sistema financeiro")).toBeInTheDocument();
  });

  it("combina filtros de status e prioridade", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => tickets,
    }));
    render(<Dashboard />);

    await screen.findByText("Computador reiniciando");
    fireEvent.change(screen.getByLabelText("Filtrar por status"), { target: { value: "Aberto" } });
    fireEvent.change(screen.getByLabelText("Filtrar por prioridade"), { target: { value: "Alta" } });
    expect(screen.getByText("Computador reiniciando")).toBeInTheDocument();
    expect(screen.queryByText("Acesso ao sistema financeiro")).not.toBeInTheDocument();
  });
});
