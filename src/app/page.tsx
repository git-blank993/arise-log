import { getDailyLogs } from "@/actions/logs";
import LiveDashboard from "@/components/LiveDashboard";

export default async function DashboardPage() {
  const logs = await getDailyLogs();

  // Total historical minutes (VIT excluded from stamina)
  let totalHistoricalMinutes = 0;
  logs.forEach((log) => {
    log.statLogs.forEach((rep) => {
      if (rep.statCategory !== "VIT") {
        totalHistoricalMinutes += rep.timeTakenMinutes;
      }
    });
  });

  // Split today vs archive
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let todayLog = null;

  if (logs.length > 0) {
    const firstLogDate = new Date(logs[0].date);
    if (firstLogDate >= startOfDay) {
      todayLog = logs[0];
      todayLog.statLogs.forEach((rep: any) => {
        if (rep.statCategory !== "VIT") {
          totalHistoricalMinutes -= rep.timeTakenMinutes;
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
        <LiveDashboard todayLog={todayLog} totalHistoricalMinutes={totalHistoricalMinutes} />
      </div>
    </div>
  );
}
