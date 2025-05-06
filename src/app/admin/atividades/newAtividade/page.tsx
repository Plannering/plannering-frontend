/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiSave,
  FiArrowLeft,
  FiCalendar,
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiBookmark,
  FiChevronDown,
  FiChevronRight,
  FiActivity,
} from "react-icons/fi";
import { format, addDays, isWeekend, startOfDay, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import apiFetch from "@/core/api/fetcher";
import { getUser } from "@/core/utils/getUser";
import { Status } from "@/core/enum/status.enum";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Componente de botão de data estilizado
interface DateChipProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const DateChip: React.FC<DateChipProps> = ({ selected, onClick, children, icon = null }) => (
  <button
    type="button"
    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1
      ${
        selected
          ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
      }`}
    onClick={onClick}
  >
    {icon}
    {children}
  </button>
);

interface Materia {
  id: string;
  nome: string;
  cor: string;
}

// Função para obter próximo dia útil
const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Se for fim de semana, vá para a próxima segunda
  while (isWeekend(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
};

export default function NovaAtividade() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const today = startOfDay(new Date());

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataVencimento: today.toISOString().split("T")[0],
    peso: 0,
    nota: 0,
    status: Status.PENDENTE,
    materiaId: "",
    usuarioId: getUser?.id || "",
  });

  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        console.error("Erro ao buscar matérias:", err);
      }
    };

    fetchMaterias();
  }, []);

  // Handler para fechar o datepicker ao clicar fora
  useEffect(() => {
    if (showDatePicker) {
      const handleOutsideClick = (e: any) => {
        if (!e.target.closest(".date-picker-container")) {
          setShowDatePicker(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [showDatePicker]);

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

  // Função para lidar com datas
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      dataVencimento: date.toISOString().split("T")[0],
    }));
  };

  // Opções de data rápida
  const setQuickDate = (option: "today" | "tomorrow" | "nextBusinessDay" | "nextWeek") => {
    let newDate: Date;

    switch (option) {
      case "today":
        newDate = today;
        break;
      case "tomorrow":
        newDate = addDays(today, 1);
        break;
      case "nextBusinessDay":
        newDate = getNextBusinessDay(today);
        break;
      case "nextWeek":
        newDate = addDays(today, 7);
        break;
      default:
        newDate = today;
    }

    handleDateChange(newDate);
  };

  // Função para lidar com a entrada manual de data
  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      handleDateChange(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.titulo.trim()) {
      setError("Por favor, informe um título para a atividade.");
      return;
    }

    if (!formData.materiaId) {
      setError("Por favor, selecione uma matéria.");
      return;
    }

    // Validação de data
    const selectedDate = new Date(formData.dataVencimento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        titulo: formData.titulo.trim(),
        status: formData.status,
        dataVencimento: formData.dataVencimento ? new Date(formData.dataVencimento).toISOString() : null,
        peso: formData.peso !== undefined ? Number(formData.peso) : 0,
        nota: formData.nota !== undefined ? Number(formData.nota) : 0,
        usuarioId: getUser?.id || "",
      };

      await apiFetch("atividades", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/admin/atividades");
    } catch (err) {
      console.error("Erro ao criar atividade:", err);
      setError("Falha ao criar a atividade. Verifique os campos e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cor da matéria selecionada
  const selectedMateriaColor = materias.find((m) => m.id === formData.materiaId)?.cor || "#3b82f6";

  // Função para verificar se a data está nos próximos 7 dias
  const isDateAlertRange = (date: Date): boolean => {
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Formatação amigável da data
  const getFriendlyDateText = (date: Date): string => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  };

  // Gerar dias para o calendário simples
  const generateCalendarDays = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(1); // Primeiro dia do mês

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const days = [];

    // Dias do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      const previousMonthDate = new Date(year, month, -i);
      days.unshift({
        date: previousMonthDate,
        isCurrentMonth: false,
        isToday: isToday(previousMonthDate),
        isSelected: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        isSelected:
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear(),
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="container max-w-6xl mx-auto px-2 sm:px-5 py-6 animate-in fade-in duration-500">
      {/* Cabeçalho - mais compacto em mobile */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-slate-200">
        <div className="items-center flex flex-row gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-white hover:shadow-sm transition-all duration-200"
            onClick={() => router.back()}
          >
            <FiArrowLeft size={16} className="sm:text-lg" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Nova Atividade</h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">Adicione atividades acadêmicas</p>
          </div>
        </div>
      </div>

      {/* Formulário - ajustes para mobile */}
      <Card className="w-full max-w-6xl mx-auto shadow-md bg-white p-0 border-0 rounded-lg sm:rounded-xl overflow-hidden">
        <CardHeader
          className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6"
          style={{
            borderBottom: `1px solid ${selectedMateriaColor}30`,
            backgroundImage: `linear-gradient(to right, ${selectedMateriaColor}10, transparent)`,
          }}
        >
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: selectedMateriaColor }}></div>
            <span>Criar Nova Atividade</span>
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
              {/* Título e Descrição */}
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                <div>
                  <Label
                    htmlFor="titulo"
                    className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 flex justify-between items-center text-slate-700"
                  >
                    <div>
                      Título <span className="text-red-500">*</span>
                    </div>
                    <div className="text-slate-400 text-xs font-normal">{formData.titulo.length}/100</div>
                  </Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Trabalho de Cálculo"
                    required
                    maxLength={100}
                    className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus-visible:ring-offset-0"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="descricao"
                    className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block text-slate-700"
                  >
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Detalhes sobre a atividade..."
                    className="resize-none min-h-[80px] sm:min-h-[110px] text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus-visible:ring-offset-0"
                    rows={4}
                  />
                </div>
              </div>

              <Separator className="my-4 sm:my-6 bg-slate-100" />

              {/* Data de vencimento - ajustes para mobile */}
              <div>
                <Label
                  htmlFor="dataVencimento"
                  className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-700 flex items-center"
                >
                  <FiCalendar className="mr-1.5 sm:mr-2 text-blue-500" size={14} />
                  Data de vencimento
                </Label>

                {/* Botões de data rápida - mais compactos em mobile */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3 sm:mb-4">
                  <DateChip
                    selected={isToday(selectedDate)}
                    onClick={() => setQuickDate("today")}
                    icon={<FiClock size={12} className="text-blue-500" />}
                  >
                    Hoje
                  </DateChip>

                  <DateChip
                    selected={isTomorrow(selectedDate)}
                    onClick={() => setQuickDate("tomorrow")}
                    icon={<FiChevronRight size={12} className="text-green-500" />}
                  >
                    Amanhã
                  </DateChip>

                  <DateChip
                    selected={
                      !isToday(selectedDate) &&
                      !isTomorrow(selectedDate) &&
                      selectedDate.getTime() === getNextBusinessDay(today).getTime()
                    }
                    onClick={() => setQuickDate("nextBusinessDay")}
                  >
                    Próx. dia útil
                  </DateChip>

                  <DateChip
                    selected={selectedDate.getTime() === addDays(today, 7).getTime()}
                    onClick={() => setQuickDate("nextWeek")}
                  >
                    Próx. semana
                  </DateChip>
                </div>

                {/* Entrada manual de data estilizada - ajustada para mobile */}
                <div className="relative date-picker-container">
                  <div
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg cursor-pointer transition-all duration-200
                      ${
                        isDateAlertRange(selectedDate)
                          ? "bg-gradient-to-r from-amber-50 to-white border-amber-200 text-amber-800"
                          : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }
                      ${showDatePicker ? "ring-2 ring-blue-200 border-blue-300" : ""}
                    `}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <div
                      className={`p-1.5 sm:p-2 rounded-full ${
                        isDateAlertRange(selectedDate) ? "bg-amber-100" : "bg-blue-100"
                      }`}
                    >
                      <FiCalendar
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isDateAlertRange(selectedDate) ? "text-amber-600" : "text-blue-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="text-xs sm:text-sm font-medium">{getFriendlyDateText(selectedDate)}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">
                        {format(selectedDate, "EEEE", { locale: ptBR })}
                      </div>
                    </div>

                    {isDateAlertRange(selectedDate) && (
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs bg-amber-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-amber-700">
                        <FiClock size={10} className="sm:hidden" />
                        <FiClock size={12} className="hidden sm:block" />
                        {isToday(selectedDate) ? "Hoje" : isTomorrow(selectedDate) ? "Amanhã" : "Em breve"}
                      </div>
                    )}

                    <FiChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${
                        showDatePicker ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Calendário customizado - otimizado para mobile */}
                  {showDatePicker && (
                    <div className="absolute z-50 mt-1 bottom-0 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-2 sm:p-3 w-full sm:max-w-md ">
                      <div className="mb-2 flex justify-between items-center">
                        <button
                          type="button"
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-700"
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            handleDateChange(newDate);
                          }}
                        >
                          <FiChevronLeft size={16} />
                        </button>

                        <div className="text-xs sm:text-sm font-medium text-slate-700">
                          {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
                        </div>

                        <button
                          type="button"
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-700"
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            handleDateChange(newDate);
                          }}
                        >
                          <FiChevronRight size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                          <div
                            key={index}
                            className="text-[10px] sm:text-xs text-center text-slate-500 font-medium p-1"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                        {calendarDays.map((day, index) => (
                          <button
                            key={index}
                            type="button"
                            disabled={!day.isCurrentMonth}
                            className={`
                              p-0.5 sm:p-1 rounded-md text-[10px] sm:text-xs text-center h-7 sm:h-8 flex items-center justify-center
                              ${day.isCurrentMonth ? "hover:bg-blue-50" : "opacity-50 cursor-not-allowed"}
                              ${day.isToday ? "ring-1 ring-blue-300" : ""}
                              ${day.isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                            `}
                            onClick={() => {
                              if (day.isCurrentMonth) {
                                handleDateChange(day.date);
                                setShowDatePicker(false);
                              }
                            }}
                          >
                            {day.date.getDate()}
                          </button>
                        ))}
                      </div>

                      <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-[10px] sm:text-xs h-7 sm:h-8 w-full"
                          onClick={() => {
                            handleDateChange(today);
                            setShowDatePicker(false);
                          }}
                        >
                          Hoje
                        </Button>
                        <Button
                          type="button"
                          className="text-[10px] sm:text-xs h-7 sm:h-8 w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => setShowDatePicker(false)}
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Input nativo oculto para acessibilidade */}
                  <input
                    type="date"
                    id="dataVencimento"
                    name="dataVencimento"
                    value={formData.dataVencimento}
                    onChange={handleManualDateChange}
                    className="opacity-0 absolute top-0 left-0 w-0 h-0"
                  />
                </div>
              </div>

              {/* Peso e Nota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-2 sm:mt-3">
                <div>
                  <Label htmlFor="peso" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block text-slate-700">
                    Peso
                  </Label>
                  <Input
                    id="peso"
                    name="peso"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="Ex: 10"
                    className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus-visible:ring-offset-0"
                  />
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                    Opcional. Defina o peso desta atividade na avaliação.
                  </p>
                </div>

                <div>
                  <Label htmlFor="nota" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block text-slate-700">
                    Nota
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
                    placeholder="Ex: 8.5"
                    className="h-10 sm:h-12 text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus-visible:ring-offset-0"
                  />
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                    Opcional. Registre a nota recebida nesta atividade.
                  </p>
                </div>
              </div>

              {/* Matéria e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-2 sm:mt-3">
                <div>
                  <Label
                    htmlFor="materiaId"
                    className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 text-slate-700 flex items-center"
                  >
                    <FiBookmark className="mr-1.5 sm:mr-2 text-blue-500" size={12} />
                    Matéria <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.materiaId} onValueChange={(value) => handleSelectChange("materiaId", value)}>
                    <SelectTrigger
                      className="w-full h-10 sm:h-12 text-xs sm:text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      style={
                        formData.materiaId
                          ? { borderColor: selectedMateriaColor, borderWidth: "1px", color: selectedMateriaColor }
                          : {}
                      }
                    >
                      <SelectValue placeholder="Selecione uma matéria" />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-[200px] sm:max-h-[300px] border-slate-200 bg-white"
                      position="popper"
                    >
                      {materias.map((materia) => (
                        <SelectItem
                          key={materia.id}
                          value={materia.id}
                          className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2"
                              style={{ backgroundColor: materia.cor }}
                            ></div>
                            {materia.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="status"
                    className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 block text-slate-700"
                  >
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger className="w-full h-10 sm:h-12 text-xs sm:text-sm bg-white shadow-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="border-slate-200 bg-white">
                      <SelectItem
                        value={Status.PENDENTE}
                        className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
                      >
                        <div className="flex items-center bg-amber-100 px-2 rounded-md text-amber-600">
                          <div className="text-amber-500 mr-2">
                            <FiClock size={12} className="sm:hidden text-amber-500" />
                            <FiClock size={14} className="hidden sm:block text-amber-500" />
                          </div>
                          <span className="text-amber-500">Pendente</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value={Status.EM_ANDAMENTO}
                        className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
                      >
                        <div className="flex items-center bg-blue-100 px-2 rounded-md text-sky-600">
                          <div className=" mr-2">
                            <FiActivity size={12} className="sm:hidden text-sky-600" />
                            <FiActivity size={14} className="hidden sm:block text-sky-600" />
                          </div>
                          <span className="">Em andamento</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value={Status.CONCLUIDO}
                        className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
                      >
                        <div className="flex items-center bg-green-100 px-2 rounded-md text-green-600">
                          <div className="text-green-500 mr-2">
                            <FiCheck size={12} className="sm:hidden text-green-500" />
                            <FiCheck size={14} className="hidden sm:block text-green-500" />
                          </div>
                          <span className="text-green-700">Concluída</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value={Status.CANCELADO}
                        className="hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
                      >
                        <div className="flex items-center bg-slate-100 px-2 rounded-md text-slate-600">
                          <div className="text-slate-500 mr-2">
                            <FiX size={12} className="sm:hidden text-slate-500" />
                            <FiX size={14} className="hidden sm:block text-slate-500" />
                          </div>
                          <span className="text-slate-700">Cancelada</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </CardContent>

        {/* Footer com botões - adaptado para mobile */}
        <CardFooter className="flex flex-row sm:flex-row justify-end gap-2 sm:gap-3 py-4 sm:py-5 px-4 sm:px-6 md:px-8 border-t bg-gradient-to-r from-slate-50 to-white">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-auto px-4 sm:px-5 text-xs sm:text-sm font-medium hover:bg-slate-100 border-slate-200 order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="p-2 w-auto px-4 sm:px-6 font-medium text-xs sm:text-sm gap-2 shadow-md order-1 sm:order-2"
            style={{
              background: `linear-gradient(to right, ${selectedMateriaColor}, ${selectedMateriaColor}ee)`,
              borderColor: selectedMateriaColor,
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <FiSave size={14} className="sm:hidden" />
                <FiSave size={16} className="hidden sm:block" />
                <span className="sm:hidden">Salvar</span>
                <span className="hidden sm:block">Salvar atividade</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Componentes auxiliares
const FiChevronLeft = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`feather feather-chevron-left ${className}`}
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const FiX = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`feather feather-x ${className}`}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
