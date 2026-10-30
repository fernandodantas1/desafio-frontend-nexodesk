"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronRight, CircleDot, Clock3, Plus,
  Search, TicketCheck, Trash2, RefreshCcw, SlidersHorizontal, Moon, Sun,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Dialog } from "./dialog";
import { TicketForm } from "./ticket-form";
import { Ticket, TicketStatus, Priority, statuses, priorities } from "@/lib/tickets";
import { TicketFormValues } from "@/lib/schema";

const priorityStyle: Record<Priority, string> = {
  Alta: "bg-red-50 text-red-700 ring-red-600/10",
  Média: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Baixa: "bg-blue-50 text-blue-700 ring-blue-600/10",
};

const statusStyle: Record<TicketStatus, string> = {
  Aberto: "bg-blue-50 text-blue-700",
  "Em Andamento": "bg-amber-50 text-amber-700",
  Concluído: "bg-emerald-50 text-emerald-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  async function loadTickets() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tickets", { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar os chamados.");
      setTickets(await response.json());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadTickets(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedTheme = window.localStorage.getItem("nexodesk-theme");
      const enabled = savedTheme === "dark";
      setDarkMode(enabled);
      document.documentElement.classList.toggle("dark", enabled);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(debouncedSearch.toLowerCase().trim());
    const matchesStatus = statusFilter === "Todos" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "Todas" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }), [tickets, debouncedSearch, statusFilter, priorityFilter]);

  async function createTicket(values: TicketFormValues) {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) throw new Error("Não foi possível criar o chamado.");
    const ticket = await response.json() as Ticket;
    setTickets((current) => [ticket, ...current]);
    setNewOpen(false);
    toast.success("Chamado criado com sucesso");
  }

  async function changeStatus(ticket: Ticket, status: TicketStatus) {
    const response = await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return toast.error("Não foi possível alterar o status.");
    const updated = await response.json() as Ticket;
    setTickets((current) => current.map((item) => item.id === ticket.id ? updated : item));
    if (selected?.id === ticket.id) setSelected(updated);
    toast.success("Status atualizado");
  }

  async function deleteTicket() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/tickets/${deleteTarget.id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Não foi possível excluir o chamado.");
    setTickets((current) => current.filter((item) => item.id !== deleteTarget.id));
    setSelected(null);
    setDeleteTarget(null);
    toast.success("Chamado excluído");
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("Todos");
    setPriorityFilter("Todas");
  }

  function toggleDarkMode() {
    const enabled = !darkMode;
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
    window.localStorage.setItem("nexodesk-theme", enabled ? "dark" : "light");
  }

  const counts = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Aberto").length,
    progress: tickets.filter((ticket) => ticket.status === "Em Andamento").length,
    done: tickets.filter((ticket) => ticket.status === "Concluído").length,
  };

  const metricCards = [
    { label: "Total de chamados", value: counts.total, icon: TicketCheck, color: "bg-orange-50 text-orange-600" },
    { label: "Abertos", value: counts.open, icon: CircleDot, color: "bg-blue-50 text-blue-600" },
    { label: "Em andamento", value: counts.progress, icon: Clock3, color: "bg-amber-50 text-amber-600" },
    { label: "Concluídos", value: counts.done, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <main className="app-shell min-h-screen">
      <Toaster richColors position="top-right" />
      <header className="app-header border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ed6a4a] text-white shadow-lg shadow-orange-200">
              <TicketCheck size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">NexoDesk</h1>
              <p className="text-xs text-slate-500">Central de chamados internos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Ativar tema claro" : "Ativar tema escuro"}
              aria-pressed={darkMode}
              title={darkMode ? "Tema claro" : "Tema escuro"}
              className="theme-toggle flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button type="button" onClick={() => setNewOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#ed6a4a] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 hover:bg-[#d95639] sm:px-4">
              <Plus size={18} aria-hidden="true" /><span className="hidden sm:inline">Novo chamado</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map(({ label, value, icon: Icon, color }) => (
            <article key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p></div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></div>
            </article>
          ))}
        </div>

        <section className="app-panel mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input aria-label="Buscar chamado" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
            </div>
            <select aria-label="Filtrar por status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-400">
              <option>Todos</option>{statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select aria-label="Filtrar por prioridade" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-400">
              <option>Todas</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
            <button onClick={clearFilters} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <SlidersHorizontal size={16} />Limpar filtros
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <AlertCircle className="mb-3 text-red-500" size={34} />
              <p className="font-semibold text-slate-800">Não foi possível carregar os chamados</p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button onClick={loadTickets} className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"><RefreshCcw size={16} />Tentar novamente</button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Search size={26} /></div>
              <p className="font-semibold text-slate-800">Nenhum chamado encontrado</p>
              <p className="mt-1 text-sm text-slate-500">Tente alterar os termos ou filtros da busca.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-b-2xl">
              {filteredTickets.map((ticket, index) => (
                <article key={ticket.id} className={`group flex flex-col gap-4 px-4 py-5 transition sm:flex-row sm:items-center sm:px-5 ${index % 2 === 0 ? "bg-white hover:bg-orange-50/60" : "bg-[#edf1f5] hover:bg-[#e3e9ef]"}`}>
                  <button onClick={() => setSelected(ticket)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${index % 2 === 0 ? "bg-orange-50 text-orange-600" : "bg-white text-[#d95639]"}`}><TicketCheck size={19} /></div>
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">{ticket.id}</span><span className="text-slate-300">•</span><span className="text-xs text-slate-500">{ticket.sector}</span>
                      </div>
                      <h3 className="truncate font-semibold text-slate-900">{ticket.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 sm:hidden">{formatDate(ticket.createdAt)}</p>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityStyle[ticket.priority]}`}>{ticket.priority}</span>
                    <select aria-label={`Status do chamado ${ticket.title}`} value={ticket.status} onChange={(event) => void changeStatus(ticket, event.target.value as TicketStatus)} className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${statusStyle[ticket.status]}`}>
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <span className="hidden w-24 text-right text-xs text-slate-500 lg:block">{formatDate(ticket.createdAt)}</span>
                    <button aria-label={`Excluir ${ticket.title}`} onClick={() => setDeleteTarget(ticket)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>
                    <button aria-label={`Ver detalhes de ${ticket.title}`} onClick={() => setSelected(ticket)} className="rounded-lg p-2 text-slate-400 hover:bg-orange-100 hover:text-orange-600"><ChevronRight size={18} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={newOpen} title="Novo chamado" onClose={() => setNewOpen(false)} size="lg">
        <TicketForm onSubmit={createTicket} onCancel={() => setNewOpen(false)} />
      </Dialog>

      <Dialog open={Boolean(selected)} title="Detalhes do chamado" onClose={() => setSelected(null)} size="lg">
        {selected && <div className="space-y-6 px-6 py-6">
          <div><p className="text-xs font-semibold text-orange-600">{selected.id}</p><h3 className="mt-1 text-xl font-bold text-slate-900">{selected.title}</h3></div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{selected.description}</div>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {[["Solicitante", selected.requesterName], ["E-mail", selected.requesterEmail], ["Setor", selected.sector], ["Criado em", formatDate(selected.createdAt)], ["Prioridade", selected.priority], ["Status", selected.status]].map(([label, value]) => (
              <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd></div>
            ))}
          </dl>
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <button onClick={() => setDeleteTarget(selected)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Excluir chamado</button>
            <select value={selected.status} onChange={(event) => void changeStatus(selected, event.target.value as TicketStatus)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700">
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>}
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} title="Excluir chamado" onClose={() => setDeleteTarget(null)}>
        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-slate-600">Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancelar</button>
            <button onClick={() => void deleteTicket()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
