import React, { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DataSelectProps {
  htmlFor: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

interface DateChipProps {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

const DateChip: React.FC<DateChipProps> = ({ children, selected, onClick, icon }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-medium rounded-full transition-colors
        ${
          selected
            ? "bg-sky-100 text-sky-700 border border-sky-200"
            : "bg-white border border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-slate-700"
        }
      `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </button>
  );
};

export default function DataSelect({ htmlFor, label, value, onChange, required = false }: DataSelectProps) {
  const getCurrentDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);

    if (isDateToday(dateString)) return "Hoje";
    if (isDateTomorrow(dateString)) return "Amanhã";

    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getDayOfWeek = (dateString: string): string => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);

    return format(date, "EEEE", { locale: ptBR });
  };

  const addDaysToDate = (dateString: string, days: number): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);

    date.setDate(date.getDate() + days);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`;
  };

  const isDateToday = (dateString: string): boolean => {
    return dateString === getCurrentDateString();
  };

  const isDateTomorrow = (dateString: string): boolean => {
    return dateString === addDaysToDate(getCurrentDateString(), 1);
  };

  const isDateInAlertRange = (dateString: string): boolean => {
    const today = getCurrentDateString();
    const threeDaysLater = addDaysToDate(today, 3);

    return dateString >= today && dateString <= threeDaysLater;
  };

  const getNextBusinessDay = (dateString: string): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);

    date.setDate(date.getDate() + 1);

    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) {
      date.setDate(date.getDate() + 1);
    } else if (dayOfWeek === 6) {
      date.setDate(date.getDate() + 2);
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`;
  };

  const generateCalendarDays = (year: number, month: number, selectedDate: string) => {
    const result = [];
    const today = getCurrentDateString();

    const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0).getDay();

    const lastDayOfMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();

    const lastDayOfPrevMonth = new Date(year, month, 0, 12, 0, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = lastDayOfPrevMonth - firstDayOfMonth + i + 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 11 : month - 1;
      const dateString = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      result.push({
        day,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
      });
    }

    for (let day = 1; day <= lastDayOfMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      result.push({
        day,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
      });
    }

    const daysNeeded = 42 - result.length;

    for (let day = 1; day <= daysNeeded; day++) {
      const nextMonthYear = month === 11 ? year + 1 : year;
      const nextMonth = month === 11 ? 0 : month + 1;
      const dateString = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      result.push({
        day,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === today,
        isSelected: dateString === selectedDate,
      });
    }

    return result;
  };

  const [selectedDate, setSelectedDate] = useState<string>(value || getCurrentDateString());

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const convertDateFormat = (dateString: string, toFormat: "iso" | "brazilian"): string => {
    if (!dateString) return "";

    if (toFormat === "iso" && dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    } else if (toFormat === "brazilian" && dateString.includes("-")) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    return dateString;
  };

  const [calendarView, setCalendarView] = useState<{ year: number; month: number }>(() => {
    if (value) {
      const [year, month] = value.split("-").map(Number);
      return { year, month: month - 1 };
    }

    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    if (value) {
      const isoDate = value.includes("/") ? convertDateFormat(value, "iso") : value;
      setSelectedDate(isoDate);

      if (isoDate) {
        const [year, month] = isoDate.split("-").map(Number);
        setCalendarView({ year, month: month - 1 });
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".date-picker-container") && showDatePicker) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  const handleDateChange = (dateString: string) => {
    console.log("Data selecionada:", dateString);
    setSelectedDate(dateString);

    onChange(dateString);
  };

  const handleQuickSelect = (option: string) => {
    const today = getCurrentDateString();

    switch (option) {
      case "today":
        handleDateChange(today);
        break;
      case "tomorrow":
        handleDateChange(addDaysToDate(today, 1));
        break;
      case "nextBusinessDay":
        handleDateChange(getNextBusinessDay(today));
        break;
      case "nextWeek":
        handleDateChange(addDaysToDate(today, 7));
        break;
      default:
        handleDateChange(today);
    }
  };

  const handlePrevMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const today = getCurrentDateString();
  const tomorrow = addDaysToDate(today, 1);
  const nextBusinessDay = getNextBusinessDay(today);
  const nextWeek = addDaysToDate(today, 7);

  const calendarDays = generateCalendarDays(calendarView.year, calendarView.month, selectedDate);

  const monthName = format(new Date(calendarView.year, calendarView.month, 15, 12, 0, 0), "MMMM yyyy", {
    locale: ptBR,
  });

  return (
    <div>
      <Label htmlFor={htmlFor} className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-700 flex items-center">
        <FiCalendar className="mr-1.5 sm:mr-2 text-sky-500" size={14} />
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3 sm:mb-4">
        <DateChip
          selected={selectedDate === today}
          onClick={() => handleQuickSelect("today")}
          icon={<FiClock size={12} className="text-sky-500" />}
        >
          Hoje
        </DateChip>

        <DateChip
          selected={selectedDate === tomorrow}
          onClick={() => handleQuickSelect("tomorrow")}
          icon={<FiChevronRight size={12} className="text-green-500" />}
        >
          Amanhã
        </DateChip>

        <DateChip selected={selectedDate === nextBusinessDay} onClick={() => handleQuickSelect("nextBusinessDay")}>
          Próx. dia útil
        </DateChip>

        <DateChip selected={selectedDate === nextWeek} onClick={() => handleQuickSelect("nextWeek")}>
          Próx. semana
        </DateChip>
      </div>

      <div className="relative date-picker-container">
        <div
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg cursor-pointer transition-all duration-200
                    ${
                      isDateInAlertRange(selectedDate)
                        ? "bg-gradient-to-r from-amber-50 to-white border-amber-200 text-amber-800"
                        : "bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                    }
                    ${showDatePicker ? "ring-2 ring-sky-200 border-sky-300" : ""}
                  `}
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <div
            className={`p-1.5 sm:p-2 rounded-full ${isDateInAlertRange(selectedDate) ? "bg-amber-100" : "bg-sky-100"}`}
          >
            <FiCalendar
              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                isDateInAlertRange(selectedDate) ? "text-amber-600" : "text-sky-600"
              }`}
            />
          </div>

          <div className="flex-1">
            <div className="text-xs sm:text-sm font-medium">{formatDateForDisplay(selectedDate)}</div>
            <div className="text-[10px] sm:text-xs text-slate-500">{getDayOfWeek(selectedDate)}</div>
          </div>

          {isDateInAlertRange(selectedDate) && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs bg-amber-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-amber-700">
              <FiClock size={10} className="sm:hidden" />
              <FiClock size={12} className="hidden sm:block" />
              {isDateToday(selectedDate) ? "Hoje" : isDateTomorrow(selectedDate) ? "Amanhã" : "Em breve"}
            </div>
          )}

          <FiChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${
              showDatePicker ? "transform rotate-180" : ""
            }`}
          />
        </div>

        {showDatePicker && (
          <div
            className="absolute z-50 bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-full sm:max-w-md animate-in fade-in duration-200 zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute bottom-[-8px] right-6 w-4 h-4 bg-white border-r border-b border-slate-200 transform rotate-45"></div>

            <div className="mb-3 flex justify-between items-center bg-sky-100 rounded-md p-2">
              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-sky-50 text-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevMonth();
                }}
              >
                <FiChevronLeft size={18} />
              </button>

              <div className=" font-medium text-slate-700  capitalize">{monthName}</div>

              <button
                type="button"
                className="p-1.5 rounded-md hover:bg-sky-50 text-slate-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextMonth();
                }}
              >
                <FiChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 bg-">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                <div
                  key={index}
                  className="text-[10px] sm:text-xs text-center text-slate-500 font-medium pb-1 border-b border-slate-50"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={!day.isCurrentMonth}
                  className={`
            p-0.5 sm:p-1 rounded-md text-xs text-center h-8 w-8 flex items-center justify-center
            transition-all duration-200
            ${!day.isCurrentMonth ? "text-slate-300" : "text-slate-700"}
            ${day.isCurrentMonth ? "hover:bg-sky-50 hover:text-sky-700" : "cursor-not-allowed"}
            ${day.isToday && !day.isSelected ? "ring-1 ring-sky-300 font-semibold" : ""}
            ${
              day.isSelected
                ? "bg-sky-500 text-white hover:bg-sky-600 shadow-sm"
                : day.isCurrentMonth
                ? "bg-white"
                : "bg-transparent"
            }
          `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (day.isCurrentMonth) {
                      handleDateChange(day.dateString);
                      setShowDatePicker(false);
                    }
                  }}
                >
                  {day.day}
                </button>
              ))}
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <Button
                type="button"
                variant="outline"
                className="text-xs h-8 flex-1 transition-colors border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickSelect("today");
                  setShowDatePicker(false);
                }}
              >
                Hoje
              </Button>
              <Button
                type="button"
                className="text-xs h-8 flex-1 bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDatePicker(false);
                }}
              >
                Selecionar
              </Button>
            </div>
          </div>
        )}
        <input
          type="date"
          id={htmlFor}
          name={htmlFor}
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              handleDateChange(e.target.value);
            }
          }}
          className="opacity-0 absolute top-0 left-0 w-0 h-0"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
