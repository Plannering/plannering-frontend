"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFileText, FiArrowLeft, FiAlertCircle, FiAward } from "react-icons/fi";
import { startOfDay } from "date-fns";
import apiFetch from "@/core/api/fetcher";
import { getUser } from "@/core/utils/getUser";
import { Status } from "@/core/enum/status.enum";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import HeaderCard from "@/core/components/Cads/HeaderCard";
import CreateFooter from "@/core/components/Cads/CreateFooter";
import DataSelect from "@/core/components/Select/DataSelect";
import MateriaSelect from "@/core/components/Select/MateriaSelect";
import StatusSelect from "@/core/components/Select/StatusSelect";

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

export default function NovaProva() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const today = startOfDay(new Date());

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: today.toISOString().split("T")[0],
    nota: 0,
    duracao: 90,
    materiaId: "",
    local: "",
    status: Status.PENDENTE,
    usuarioId: getUser?.id || "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materiasData = await apiFetch<Materia[]>("materias");
        setMaterias(materiasData);

        if (materiasData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            materiaId: materiasData[0].id,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar matérias:", err);
      }
    };

    fetchData();
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
      setError("Por favor, informe um título para a prova.");
      return;
    }

    if (!formData.materiaId) {
      setError("Por favor, selecione uma matéria.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao,
        data: new Date(formData.data),
        nota: formData.nota !== undefined ? Number(formData.nota) : 0,
        duracao: formData.duracao !== undefined ? Number(formData.duracao) : 90,
        local: formData.local.trim() || "Sem local definido",
        status: formData.status,
        materiaId: formData.materiaId,
        usuarioId: getUser?.id || "",
      };

      await apiFetch("provas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/admin/provas");
    } catch (err) {
      console.error("Erro ao criar prova:", err);
      setError("Falha ao criar a prova. Verifique os campos e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMateriaColor = materias.find((m) => m.id === formData.materiaId)?.cor || "#3b82f6";

  return (
    <div className="container max-w-4xl mx-auto px-2 sm:px-5 py-6 animate-in fade-in duration-500">
      <HeaderCard
        title="Nova Prova"
        description="Adicione suas próximas avaliações à agenda"
        buttonLabel="Voltar para Provas"
        buttonHref="/admin/provas"
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
            <span>Detalhes da Prova</span>
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
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-3/4">
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
                      placeholder="Ex: Prova de Matemática - Trigonometria"
                      required
                      maxLength={100}
                      className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <Label
                      htmlFor="nota"
                      className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 flex items-center text-slate-700"
                    >
                      <FiAward className="mr-1.5 text-sky-500" size={14} />
                      Valor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nota"
                      name="nota"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.nota}
                      onChange={handleChange}
                      placeholder="Ex: 10.0"
                      className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    />
                  </div>
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
                    placeholder="Anotações sobre a prova, conteúdos que serão cobrados, dicas, etc."
                    className="resize-none min-h-[80px] sm:min-h-[110px] text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                    rows={4}
                  />
                </div>
              </div>

              <Separator className="my-4 sm:my-6 bg-slate-100" />

              <DataSelect
                htmlFor="data"
                label="Data da prova"
                value={formData.data}
                onChange={(value) => handleSelectChange("data", value)}
                required
              />

              <Separator className="my-4 sm:my-6 bg-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <MateriaSelect
                  htmlFor="materia"
                  value={formData.materiaId}
                  onValueChange={(value) => handleSelectChange("materiaId", value)}
                  materias={materias}
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
          saveButtonLabel="Salvar prova"
        />
      </Card>
    </div>
  );
}
