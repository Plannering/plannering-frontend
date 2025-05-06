"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiArrowLeft, FiCheck, FiAlertCircle, FiInfo, FiEdit3 } from "react-icons/fi";
import apiFetch from "@/core/api/fetcher";
import { getUser } from "@/core/utils/getUser";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import HeaderCard from "@/core/components/Cads/HeaderCard";
import CreateFooter from "@/core/components/Cads/CreateFooter";

const coresPredefinidas = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#64748b",
  "#0f172a",
];

export default function NovaMateria() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cor: "#3b82f6",
    usuarioId: getUser?.id || "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorSelect = (cor: string) => {
    setFormData((prev) => ({
      ...prev,
      cor,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      setError("Por favor, informe o nome da matéria.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiFetch("materias", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          nome: formData.nome.trim(),
          usuarioId: getUser?.id || "",
        }),
      });

      router.push("/admin/materias");
    } catch (err) {
      console.error("Erro ao criar matéria:", err);
      setError("Falha ao criar a matéria. Verifique os campos e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-2 sm:px-5 py-6 animate-in fade-in duration-500">
      <HeaderCard
        title="Nova Matéria"
        description="Adicione matérias ao seu plano de estudos"
        buttonLabel="Voltar para Matérias"
        buttonHref="/admin/materias"
        buttonIcon={<FiArrowLeft className="mr-2" />}
        buttonColor="sky"
      />

      <Card className="w-full max-w-4xl mx-auto shadow-md bg-white p-0 border-0 rounded-lg sm:rounded-xl overflow-hidden">
        <CardHeader
          className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-6"
          style={{
            borderBottom: `1px solid ${formData.cor}30`,
            backgroundImage: `linear-gradient(to right, ${formData.cor}10, transparent)`,
          }}
        >
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: formData.cor }}></div>
            <span>Informações da Matéria</span>
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
            <div>
              <Label
                htmlFor="nome"
                className="text-xs sm:text-sm font-medium mb-1.5 flex justify-between items-center text-slate-700"
              >
                <div className="flex items-center">
                  <FiEdit3 className="mr-1.5 text-sky-500" size={14} />
                  Nome da Matéria <span className="text-red-500">*</span>
                </div>
                <div className="text-slate-400 text-xs font-normal">{formData.nome.length}/50</div>
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Matemática, Física, Programação..."
                required
                maxLength={50}
                className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
              />
            </div>

            <div>
              <Label htmlFor="cor" className="text-xs sm:text-sm font-medium mb-1.5 block text-slate-700">
                Cor da Matéria
              </Label>

              <div className="flex flex-wrap gap-2 mb-3">
                {coresPredefinidas.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full transition-all duration-200
                      ${
                        formData.cor === cor
                          ? "ring-2 ring-offset-2 ring-slate-300 transform scale-110"
                          : "hover:scale-105"
                      }
                    `}
                    style={{ backgroundColor: cor }}
                    onClick={() => handleColorSelect(cor)}
                    title={`Selecionar cor ${cor}`}
                  >
                    {formData.cor === cor && <FiCheck className="text-white m-auto" size={14} />}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center border border-slate-200"
                  style={{ backgroundColor: formData.cor }}
                >
                  <input
                    type="color"
                    name="cor"
                    id="cor"
                    value={formData.cor}
                    onChange={handleChange}
                    className="opacity-0 absolute w-10 h-10 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  name="cor"
                  value={formData.cor}
                  onChange={handleChange}
                  className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <FiInfo className="inline mr-1" size={12} />
                Selecione uma cor predefinida ou use o seletor para cores personalizadas
              </p>
            </div>

            <div>
              <Label
                htmlFor="descricao"
                className="text-xs sm:text-sm font-medium mb-1.5 flex items-center text-slate-700"
              >
                <FiEdit3 className="mr-1.5 text-sky-500" size={14} />
                Descrição
              </Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Conteúdos, observações, horários, bibliografia, etc."
                className="resize-none min-h-[90px] sm:min-h-[110px] text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                rows={4}
              />
            </div>
          </form>
        </CardContent>

        <CreateFooter
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          selectedMateriaColor={formData.cor}
          saveButtonLabel="Salvar matéria"
          saveIcon={<FiSave size={14} />}
        />
      </Card>
    </div>
  );
}
