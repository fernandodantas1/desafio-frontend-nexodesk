"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { priorities, sectors } from "@/lib/tickets";
import { ticketSchema, TicketFormValues } from "@/lib/schema";
import { LoaderCircle } from "lucide-react";

interface TicketFormProps {
  onSubmit: (values: TicketFormValues) => Promise<void>;
  onCancel: () => void;
}

const fieldClass = "mt-2 w-full rounded-xl border border-[#ed6a4a] bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-[#d95639] focus:ring-4 focus:ring-orange-100";

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-6">
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="title">Título</label>
        <input id="title" {...register("title")} placeholder="Resuma o problema" className={fieldClass} />
        {errors.title && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="description">Descrição</label>
        <textarea id="description" {...register("description")} rows={4} placeholder="Descreva o que está acontecendo" className={`${fieldClass} resize-none`} />
        {errors.description && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.description.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="requesterName">Nome do solicitante</label>
          <input id="requesterName" {...register("requesterName")} placeholder="Nome completo" className={fieldClass} />
          {errors.requesterName && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.requesterName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="requesterEmail">E-mail</label>
          <input id="requesterEmail" type="email" {...register("requesterEmail")} placeholder="nome@empresa.com" className={fieldClass} />
          {errors.requesterEmail && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.requesterEmail.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="sector">Setor</label>
          <select id="sector" {...register("sector")} defaultValue="" className={fieldClass}>
            <option value="" disabled>Selecione</option>
            {sectors.map((sector) => <option key={sector}>{sector}</option>)}
          </select>
          {errors.sector && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.sector.message}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="priority">Prioridade</label>
          <select id="priority" {...register("priority")} defaultValue="" className={fieldClass}>
            <option value="" disabled>Selecione</option>
            {priorities.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
          {errors.priority && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.priority.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
        <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 rounded-xl bg-[#ed6a4a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d95639] disabled:opacity-60">
          {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
          Criar chamado
        </button>
      </div>
    </form>
  );
}
