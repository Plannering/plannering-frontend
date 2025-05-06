"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiArrowLeft, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";
import apiFetch from "@/core/api/fetcher";
import { getUser } from "@/core/utils/getUser";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

// Cores pré-definidas para facilitar a seleção
const coresPredefinidas = [
  "#3b82f6", // Azul
  "#ef4444", // Vermelho
  "#10b981", // Verde
  "#f59e0b", // Amarelo
  "#8b5cf6", // Roxo
  "#ec4899", // Rosa
  "#06b6d4", // Ciano
  "#f97316", // Laranja
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#64748b", // Slate
  "#0f172a", // Slate escuro
];

export default function NovaMateria() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    professor: "",
    descricao: "",
    cor: "#3b82f6", // Azul padrão
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
          usuarioId: getUser?.id || "", // Garantir que o ID do usuário esteja presente
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
    <div className="container max-w-6xl justify-center p-0 items-center mx-auto px-3 sm:px-5 py-4 sm:py-8 animate-in fade-in duration-500">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-200">
        <div className="items-center flex flex-row gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 hover:bg-slate-100"
            onClick={() => router.back()}
          >
            <FiArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Nova Matéria</h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Adicione matérias ao seu plano de estudos</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 p-0">
        {/* Coluna do formulário */}
        <div className="w-full p-0">
          <Card className="shadow-sm p-0 pt-2">
            <CardHeader
              className="pt-5 border-b px-4 sm:px-6"
              style={{
                borderLeftWidth: "3px",
                borderLeftStyle: "solid",
                borderLeftColor: formData.cor,
              }}
            >
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.cor }}></div>
                <span>Informações da Matéria</span>
                <div className="ml-auto text-xs text-slate-500 font-normal">*Campos obrigatórios</div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-5 px-4 sm:px-6">
              {error && (
                <div className="mb-5 bg-red-50 border-l-4 border-red-400 p-3 rounded-md text-red-700 flex items-center text-xs animate-in slide-in-from-top duration-300">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome */}
                <div>
                  <Label
                    htmlFor="nome"
                    className="text-xs font-semibold mb-1.5 flex justify-between items-center text-slate-700"
                  >
                    <div>
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
                    className="h-10 sm:h-11 text-sm focus-visible:ring-slate-200"
                  />
                </div>

                {/* Cores */}
                <div>
                  <Label htmlFor="cor" className="text-xs font-semibold mb-1.5 block text-slate-700">
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
                      className="h-10 sm:h-11 text-sm focus-visible:ring-slate-200"
                      maxLength={7}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <FiInfo className="inline mr-1" size={12} />
                    Selecione uma cor predefinida ou use o seletor para cores personalizadas
                  </p>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="descricao" className="text-xs font-semibold mb-1.5 block text-slate-700">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Conteúdos, observações, horários, bibliografia, etc."
                    className="resize-none min-h-[90px] sm:min-h-[110px] text-sm focus-visible:ring-slate-200"
                    rows={4}
                  />
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex flex-row justify-end gap-3 py-4 px-4 sm:px-6 border-t">
              <Button variant="outline" onClick={() => router.back()} className="h-9 sm:h-10 text-xs sm:text-sm">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-9 sm:h-10 gap-2 text-xs sm:text-sm"
                style={{
                  backgroundColor: formData.cor,
                  borderColor: formData.cor,
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FiSave /> Salvar
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
