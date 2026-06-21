"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DatePickerNav({ currentDate, isToday }: { currentDate: string; isToday: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Month navigation state
  const [viewDate, setViewDate] = useState(new Date(currentDate + "T00:00:00"));

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset view date when opening
  useEffect(() => {
    if (open) {
      setViewDate(new Date(currentDate + "T00:00:00"));
    }
  }, [open, currentDate]);

  // Calendar logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // padding
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleSelect = (day: number) => {
    const selected = new Date(year, month, day);
    const yyyymmdd = selected.getFullYear() + "-" + String(selected.getMonth() + 1).padStart(2, "0") + "-" + String(selected.getDate()).padStart(2, "0");
    setOpen(false);
    router.push(`/?date=${yyyymmdd}`);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const targetDisplayDate = new Date(currentDate + "T00:00:00");

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 group outline-none"
      >
        <h1 className="text-2xl font-semibold text-[#ededed] group-hover:text-white transition-colors">
          {isToday ? "Today" : targetDisplayDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </h1>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg shadow-2xl w-64 origin-top-left">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-[#555] hover:text-[#ededed] transition-colors rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-medium text-[#ededed]">
              {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <button onClick={nextMonth} className="p-1 text-[#555] hover:text-[#ededed] transition-colors rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-[#555]">
                {d}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              
              const isSelected = day === targetDisplayDate.getDate() && month === targetDisplayDate.getMonth() && year === targetDisplayDate.getFullYear();
              const isTodayActual = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => handleSelect(day)}
                  className={`
                    h-8 w-8 rounded text-xs flex items-center justify-center transition-colors
                    ${isSelected ? "bg-[#ededed] text-[#0a0a0a] font-semibold" : 
                      isTodayActual ? "border border-[#333] text-[#ededed] hover:bg-[#1a1a1a]" :
                      "text-[#888] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
