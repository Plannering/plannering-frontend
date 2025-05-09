"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFileText, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { startOfDay } from "date-fns";
import apiFetch from "@/core/api/fetcher";
import { getUser } from "@/core/utils/getUser";
import { Status } from "@/core/enum/status.enum";
import { Prioridade } from "@/core/enum/prioridades.enum";

// Componentes
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Componentes personalizados
import HeaderCard from "@/core/components/Cads/HeaderCard";
import CreateFooter from "@/core/components/Cads/CreateFooter";
import DataSelect from "@/core/components/Select/DataSelect";
import MateriaSelect from "@/core/components/Select/MateriaSelect";
import StatusSelect from "@/core/components/Select/StatusSelect";
import PrioridadeSelect from "@/core/components/Select/PrioridadeSelect";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

export default function NovaTarefa() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const today = startOfDay(new Date());

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataVencimento: today.toISOString().split("T")[0],
    prioridade: Prioridade.MEDIA,
    status: Status.PENDENTE,
    materiaId: "",
    usuarioId: getUser?.id || "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const data = await apiFetch<Materia[]>("materias");
        setMaterias(data);

        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            materiaId: data[0].id,
          }));
        }
      } catch (err) {
        console.error("", err);
      }
    };

    fetchMaterias();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      setError("Por favor, informe um título para a tarefa.");
      return;
    }

    if (!formData.materiaId) {
      setError("Por favor, selecione uma matéria.");
      return;
    }

    let dataFormatada;

    if (formData.dataVencimento) {
      if (formData.dataVencimento.includes("/")) {
        const [dia, mes, ano] = formData.dataVencimento.split("/").map(Number);
        dataFormatada = new Date(ano, mes - 1, dia, 12, 0, 0).toISOString();
      } else if (formData.dataVencimento.includes("-")) {
        const date = new Date(formData.dataVencimento);
        dataFormatada = date.toISOString();
      } else {
        dataFormatada = null;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        titulo: formData.titulo.trim(),
        status: formData.status,
        dataVencimento: dataFormatada || null,
        usuarioId: getUser?.id || "",
      };

      await apiFetch("tarefas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/admin/tarefas");
    } catch (err) {
      console.error("", err);
      setError("Falha ao criar a tarefa. Verifique os campos e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cor da matéria selecionada
  const selectedMateriaColor = materias.find((m) => m.id === formData.materiaId)?.cor || "#3b82f6";

  return (
    <div className="container max-w-4xl mx-auto px-2 sm:px-5 py-6 animate-in fade-in duration-500">
      <HeaderCard
        title="Nova Tarefa"
        description="Adicione tarefas à sua lista de afazeres"
        buttonLabel="Voltar para Tarefas"
        buttonHref="/admin/tarefas"
        buttonIcon={<FiArrowLeft className="mr-2" />}
        buttonColor="sky"
      />

      <Card className="w-full max-w-4xl mx-auto shadow-md bg-white p-0 border-0 rounded-lg sm:rounded-xl overflow-hidden">
        <CardHeader
          className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6"
          style={{
            borderBottom: `1px solid ${selectedMateriaColor}30`,
            backgroundImage: `linear-gradient(to right, ${selectedMateriaColor}10, transparent)`,
          }}
        >
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: selectedMateriaColor }}></div>
            <span>Detalhes da Tarefa</span>
            <div className="ml-auto text-xs text-slate-500 font-normal">*Obrigatório</div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8">
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg text-red-700 flex items-center text-xs animate-in slide-in-from-top duration-300">
              <FiAlertCircle className="mr-2 flex-shrink-0 text-red-500" size={16} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <div>
                  <Label
                    htmlFor="titulo"
                    className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 flex justify-between items-center text-slate-700"
                  >
                    <div className="flex items-center">
                      <FiFileText className="mr-1.5 text-sky-500" size={14} />
                      Título <span className="text-red-500">*</span>
                    </div>
                    <div className="text-slate-400 text-xs font-normal">{formData.titulo.length}/100</div>
                  </Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Estudar para prova de matemática"
                    required
                    maxLength={100}
                    className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="descricao"
                    className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 flex items-center text-slate-700"
                  >
                    <FiFileText className="mr-1.5 text-sky-500" size={14} />
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Detalhes sobre a tarefa..."
                    className="resize-none min-h-[80px] sm:min-h-[110px] text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    rows={4}
                  />
                </div>
              </div>

              <Separator className="my-4 sm:my-6 bg-slate-100" />

              <DataSelect
                htmlFor="dataVencimento"
                label="Data de vencimento"
                value={formData.dataVencimento}
                onChange={(value) => handleSelectChange("dataVencimento", value)}
                required
              />

              <Separator className="my-4 sm:my-6 bg-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <MateriaSelect
                  htmlFor="materia"
                  value={formData.materiaId}
                  onValueChange={(value) => handleSelectChange("materiaId", value)}
                  materias={materias}
                  required
                />

                <PrioridadeSelect
                  htmlFor="prioridade"
                  value={formData.prioridade}
                  onValueChange={(value) => handleSelectChange("prioridade", value)}
                  required
                />

                <StatusSelect
                  htmlFor="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CreateFooter
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          selectedMateriaColor={selectedMateriaColor}
          saveButtonLabel="Salvar tarefa"
        />
      </Card>
    </div>
  );
}
