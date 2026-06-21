import { getDailyLogs } from "@/actions/logs";
import LiveDashboard from "@/components/LiveDashboard";

// Shared XP rank logic — must match profile/page.tsx exactly
function calcRankFromXP(totalXP: number) {
  if (totalXP >= 50000) return "S";
  if (totalXP >= 30000) return "A";
  if (totalXP >= 15000) return "B";
  if (totalXP >= 5000)  return "C";
  if (totalXP >= 1000)  return "D";
  return "E";
}

export default async function DashboardPage() {
  const logs = await getDailyLogs();

  // ── Calculate total XP (same formula as profile page) ────────────────────────
  let totalXP = 1000; // Awakening bonus
  let totalHistoricalMinutes = 0;

  logs.forEach((log) => {
    const hasActivity = (log.quests?.length ?? 0) > 0 || (log.statLogs?.length ?? 0) > 0;
    if (!hasActivity) totalXP -= 500; // Zero day penalty

    log.quests?.forEach((q: any) => {
      if (q.isCompleted) totalXP += 50;
      else totalXP -= 50;
    });

    const distinctStats = new Set<string>();
    log.statLogs?.forEach((rep: any) => {
      if (rep.statCategory !== "VIT") {
        totalHistoricalMinutes += rep.timeTakenMinutes;
        totalXP += rep.timeTakenMinutes * 10;
      }
      distinctStats.add(rep.statCategory);
    });

    const nonVit = [...distinctStats].filter((s) => s !== "VIT");
    if (nonVit.length >= 5) totalXP += 500;
  });

  totalXP = Math.max(0, totalXP);
  const currentRank = calcRankFromXP(totalXP);

  // ── Split today vs archive ────────────────────────────────────────────────────
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let todayLog = null;
  let historicalMinutesExcludingToday = totalHistoricalMinutes;

  if (logs.length > 0) {
    const firstLogDate = new Date(logs[0].date);
    if (firstLogDate >= startOfDay) {
      todayLog = logs[0];
      // Subtract today's minutes so LiveDashboard can add them back dynamically
      todayLog.statLogs?.forEach((rep: any) => {
        if (rep.statCategory !== "VIT") {
          historicalMinutesExcludingToday -= rep.timeTakenMinutes;
        }
      });
    }
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-[#ededed]">Today</h1>
          <p className="text-xs text-[#555]">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <LiveDashboard
          todayLog={todayLog}
          totalHistoricalMinutes={historicalMinutesExcludingToday}
          currentRank={currentRank}
        />
      </div>
    </div>
  );
}
