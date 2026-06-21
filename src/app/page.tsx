import { getDailyLogs } from "@/actions/logs";
import LiveDashboard from "@/components/LiveDashboard";
import { DatePickerNav } from "@/components/DatePickerNav";

// Shared XP rank logic — must match profile/page.tsx exactly
function calcRankFromXP(totalXP: number) {
  if (totalXP >= 50000) return "S";
  if (totalXP >= 30000) return "A";
  if (totalXP >= 15000) return "B";
  if (totalXP >= 5000)  return "C";
  if (totalXP >= 1000)  return "D";
  return "E";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date: dateQuery } = await searchParams;
  const logs = await getDailyLogs();

  // ── Calculate total XP (same formula as profile page) ────────────────────────
  let totalXP = 1000; // Awakening bonus
  let totalHistoricalMinutes = 0;

  logs.forEach((log) => {
    const isWeekend = new Date(log.date).getDay() === 0 || new Date(log.date).getDay() === 6;

    if (!log.isRestDay) {
      const hasActivity = (log.quests?.length ?? 0) > 0 || (log.statLogs?.length ?? 0) > 0;
      if (!hasActivity) totalXP -= 500; // Zero day penalty
    }

    log.quests?.forEach((q: any) => {
      if (q.isCompleted) totalXP += 50;
      else totalXP -= 50;
    });

    const distinctStats = new Set<string>();
    log.statLogs?.forEach((rep: any) => {
      if (rep.statCategory !== "VIT") {
        totalHistoricalMinutes += rep.timeTakenMinutes;
        if (rep.isPenalty) {
          totalXP -= rep.timeTakenMinutes * 10;
        } else {
          totalXP += rep.timeTakenMinutes * (isWeekend ? 20 : 10);
        }
      }
      distinctStats.add(rep.statCategory);
    });

    const nonVit = [...distinctStats].filter((s) => s !== "VIT");
    if (nonVit.length >= 5) totalXP += 500;
  });

  totalXP = Math.max(0, totalXP);
  const currentRank = calcRankFromXP(totalXP);

  // ── Target Date logic ────────────────────────────────────────────────────
  const targetDate = dateQuery ? new Date(dateQuery + "T00:00:00") : new Date();
  
  // Create a local midnight based on targetDate (handling timezone safely)
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();
  const startOfTarget = new Date(targetYear, targetMonth, targetDay);
  const endOfTarget = new Date(targetYear, targetMonth, targetDay + 1);

  let todayLog = null;
  let historicalMinutesExcludingToday = totalHistoricalMinutes;

  if (logs.length > 0) {
    // Find log that falls within target date
    const foundLog = logs.find(l => {
      const d = new Date(l.date);
      return d >= startOfTarget && d < endOfTarget;
    });

    if (foundLog) {
      todayLog = foundLog;
      // Subtract target day's minutes so LiveDashboard can add them back dynamically
      todayLog.statLogs?.forEach((rep: any) => {
        if (rep.statCategory !== "VIT") {
          historicalMinutesExcludingToday -= rep.timeTakenMinutes;
        }
      });
    }
  }

  // Next and Previous Date formatting
  const prevDate = new Date(targetYear, targetMonth, targetDay - 1);
  const nextDate = new Date(targetYear, targetMonth, targetDay + 1);
  const yyyymmdd = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  const isToday = yyyymmdd(targetDate) === yyyymmdd(new Date());

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-4">
            <DatePickerNav currentDate={yyyymmdd(targetDate)} isToday={isToday} />
          </div>
          <p className="text-xs text-[#555]">
            {targetDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <LiveDashboard
          todayLog={todayLog}
          totalHistoricalMinutes={historicalMinutesExcludingToday}
          currentRank={currentRank}
          targetDate={yyyymmdd(targetDate)}
        />
      </div>
    </div>
  );
}
