import React, { useState, useEffect, useMemo } from "react";
import { FiCalendar, FiClock, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format, isToday, isTomorrow, addDays, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DataSelectProps {
  htmlFor: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
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
  const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const formatDateString = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value ? parseDate(value) : new Date());

  const today = useMemo(() => new Date(), []);

  const isDateAlertRange = (date: Date): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const threeDaysFromNow = addDays(now, 3);
    return isWithinInterval(date, { start: now, end: threeDaysFromNow });
  };

  const getFriendlyDateText = (date: Date): string => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";

    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDateString(date));
  };

  const setQuickDate = (option: string) => {
    let newDate: Date;

    switch (option) {
      case "today":
        newDate = new Date();
        break;
      case "tomorrow":
        newDate = addDays(new Date(), 1);
        break;
      case "nextBusinessDay":
        newDate = getNextBusinessDay(new Date());
        break;
      case "nextWeek":
        newDate = addDays(new Date(), 7);
        break;
      default:
        newDate = new Date();
    }

    handleDateChange(newDate);
  };

  const getNextBusinessDay = (date: Date): Date => {
    let nextDay = addDays(date, 1);
    const dayOfWeek = nextDay.getDay();

    if (dayOfWeek === 0) {
      nextDay = addDays(nextDay, 1);
    } else if (dayOfWeek === 6) {
      nextDay = addDays(nextDay, 2);
    }

    return nextDay;
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonthLastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0).getDate();

    const days = [];

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        isSelected: format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
      });
    }

    const daysToAdd = 42 - days.length;
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
      });
    }

    return days;
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".date-picker-container") && showDatePicker) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  useEffect(() => {
    if (value) {
      setSelectedDate(parseDate(value));
    }
  }, [value]);

  return (
    <div>
      <Label htmlFor={htmlFor} className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-700 flex items-center">
        <FiCalendar className="mr-1.5 sm:mr-2 text-sky-500" size={14} />
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3 sm:mb-4">
        <DateChip
          selected={isToday(selectedDate)}
          onClick={() => setQuickDate("today")}
          icon={<FiClock size={12} className="text-sky-500" />}
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

      <div className="relative date-picker-container">
        <div
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg cursor-pointer transition-all duration-200
                    ${
                      isDateAlertRange(selectedDate)
                        ? "bg-gradient-to-r from-amber-50 to-white border-amber-200 text-amber-800"
                        : "bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                    }
                    ${showDatePicker ? "ring-2 ring-sky-200 border-sky-300" : ""}
                  `}
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          <div
            className={`p-1.5 sm:p-2 rounded-full ${isDateAlertRange(selectedDate) ? "bg-amber-100" : "bg-sky-100"}`}
          >
            <FiCalendar
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isDateAlertRange(selectedDate) ? "text-amber-600" : "text-sky-600"}`}
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

        {showDatePicker && (
          <div className="absolute z-50 mt-1 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-2 sm:p-3 w-full sm:max-w-md">
            <div className="mb-2 flex justify-between items-center">
              <button
                type="button"
                className="p-1 rounded-md hover:bg-slate-100 text-slate-700"
                onClick={(e) => {
                  e.stopPropagation();
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
                onClick={(e) => {
                  e.stopPropagation();
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
                <div key={index} className="text-[10px] sm:text-xs text-center text-slate-500 font-medium p-1">
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
                            ${day.isCurrentMonth ? "hover:bg-sky-50" : "opacity-50 cursor-not-allowed"}
                            ${day.isToday ? "ring-1 ring-sky-300" : ""}
                            ${day.isSelected ? "bg-sky-500 text-white hover:bg-sky-600" : ""}
                          `}
                  onClick={(e) => {
                    e.stopPropagation();
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateChange(today);
                  setShowDatePicker(false);
                }}
              >
                Hoje
              </Button>
              <Button
                type="button"
                className="text-[10px] sm:text-xs h-7 sm:h-8 w-full bg-sky-500 hover:bg-sky-600 text-white"
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
          value={formatDateString(selectedDate)}
          onChange={(e) => {
            if (e.target.value) {
              handleDateChange(new Date(e.target.value));
            }
          }}
          className="opacity-0 absolute top-0 left-0 w-0 h-0"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
