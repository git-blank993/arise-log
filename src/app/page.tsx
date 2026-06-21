import { getDailyLogs } from "@/actions/logs";
import { logout } from "@/actions/auth";
import LiveDashboard from "@/components/LiveDashboard";
import { LogOut } from "lucide-react";

export default async function DashboardPage() {
  const logs = await getDailyLogs();
  
  // Calculate total historical minutes for ALL logs
  let totalHistoricalMinutes = 0;
  logs.forEach(log => {
    log.dungeonReports.forEach(rep => {
      totalHistoricalMinutes += rep.timeTakenMinutes;
    });
  });

  // Check if todayLog exists
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let todayLog = null;
  let archiveLogs = logs;
  
  if (logs.length > 0) {
    const firstLogDate = new Date(logs[0].date);
    if (firstLogDate >= startOfDay) {
      todayLog = logs[0];
      archiveLogs = logs.slice(1);
      
      // Subtract today's minutes from totalHistoricalMinutes so LiveDashboard can add it dynamically
      todayLog.dungeonReports.forEach((rep: any) => {
        totalHistoricalMinutes -= rep.timeTakenMinutes;
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex justify-between items-center mb-8 max-w-2xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Status</h1>
        </div>
        <form action={logout}>
          <button type="submit" className="text-neutral-400 hover:text-white transition-colors" aria-label="Log Out">
            <LogOut className="w-6 h-6" />
          </button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto w-full space-y-12">
        {/* Today's Live Status */}
        <section>
          <LiveDashboard todayLog={todayLog} totalHistoricalMinutes={totalHistoricalMinutes} />
        </section>

        {/* Archives */}
        {archiveLogs.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-neutral-800 pb-2">System Archives</h2>
            {archiveLogs.map((log) => {
              const completedQuests = log.quests.filter(q => q.isCompleted).length;
              const totalQuests = log.quests.length;
              
              // Calculate archived log stamina
              let logMinutes = 0;
              log.dungeonReports.forEach(r => logMinutes += r.timeTakenMinutes);
              const stUsed = Math.floor((logMinutes / 480) * 100);
              const stRem = 100 - stUsed;
              
              return (
                <div key={log.id} className="status-panel space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400 text-sm">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-b border-neutral-800 pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-300 text-sm">Stamina</span>
                      {stRem <= 0 ? (
                        <span className="text-purple-400 font-bold text-sm">
                          LIMIT BREAK!
                        </span>
                      ) : (
                        <span className="text-blue-400 font-medium text-sm">
                          {stRem}% Remaining
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-300 text-sm">Daily Quests</span>
                      <span className="text-neutral-100 font-medium text-sm">
                        {completedQuests} / {totalQuests}
                      </span>
                    </div>
                  </div>

                  {log.dungeonReports.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Dungeon Reports</h3>
                      {log.dungeonReports.map((report: any) => {
                        const data = report.reportData || {};
                        return (
                          <div key={report.id} className="bg-neutral-800/50 rounded p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-mono text-xs text-neutral-500">[{report.statCategory}]</span>
                              <span className="text-neutral-500 text-xs">{report.timeTakenMinutes}m</span>
                            </div>
                            <p className="text-neutral-200 mt-1"><span className="text-neutral-500 mr-1">•</span>{data.field1}</p>
                            <p className="text-neutral-200"><span className="text-neutral-500 mr-1">•</span>{data.field2}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {log.systemNotification?.levelUpMoment && (
                    <div className="pt-2 border-t border-neutral-800">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Level Up Moment</p>
                      <p className="text-sm text-neutral-200 italic">
                        &quot;{log.systemNotification.levelUpMoment}&quot;
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
