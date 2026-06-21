import { getDailyLogs } from "@/actions/logs";
import { getUserProfile, allocateStatPoint } from "@/actions/user";
import ReactMarkdown from "react-markdown";
import { Clock, Plus } from "lucide-react";

const STAT_META: Record<string, { label: string }> = {
  STR:  { label: "Physical Training" },
  AGI:  { label: "Mental Agility" },
  INT:  { label: "Deep Learning" },
  WIS:  { label: "Architecture" },
  GOLD: { label: "Career" },
  VIT:  { label: "Recovery" },
};

const CATEGORIES = ["STR", "AGI", "INT", "WIS", "GOLD", "VIT"];

export default async function ProfilePage() {
  const [logs, userProfile] = await Promise.all([getDailyLogs(), getUserProfile()]);

  if (!userProfile) return null;

  // ── Aggregates ───────────────────────────────────────────────────────────────
  let totalPlaytimeMins = 0;
  let totalQuests = 0;
  let completedQuests = 0;
  let totalXP = 1000; // Awakening bonus

  logs.forEach((log) => {
    const isWeekend = new Date(log.date).getDay() === 0 || new Date(log.date).getDay() === 6;

    if (!log.isRestDay) {
      const hasActivity = (log.quests?.length ?? 0) > 0 || (log.statLogs?.length ?? 0) > 0;
      if (!hasActivity) totalXP -= 500; // Zero day penalty
    }

    log.quests?.forEach((q: any) => {
      if (q.isCompleted) {
        totalXP += 50;
        completedQuests++;
      } else {
        totalXP -= 50;
      }
      totalQuests++;
    });

    const distinctStats = new Set<string>();
    log.statLogs?.forEach((rep: any) => {
      if (rep.statCategory !== "VIT") {
        totalPlaytimeMins += rep.timeTakenMinutes;
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

  const winRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const totalHours = Math.floor(totalPlaytimeMins / 60);
  const totalMinsRem = totalPlaytimeMins % 60;

  // ── XP & Rank ────────────────────────────────────────────────────────────────
  const RANK_THRESHOLDS = [
    { rank: "S", base: 50000, nextLabel: "MAX" },
    { rank: "A", base: 30000, nextLabel: "S-Class" },
    { rank: "B", base: 15000, nextLabel: "A-Class" },
    { rank: "C", base:  5000, nextLabel: "B-Class" },
    { rank: "D", base:  1000, nextLabel: "C-Class" },
    { rank: "E", base:     0, nextLabel: "D-Class" },
  ];

  const tier = RANK_THRESHOLDS.find((t) => totalXP >= t.base) ?? RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];

  // ── Manual allocation ────────────────────────────────────────────────────────
  const pointsEarned = Math.floor(totalPlaytimeMins / (5 * 60)); // 1 pt per 5h
  const allocated =
    userProfile.strPoints + userProfile.agiPoints + userProfile.vitPoints +
    userProfile.intPoints + userProfile.wisPoints + userProfile.goldPoints;
  const available = 10 + pointsEarned - allocated;

  const userPoints: Record<string, number> = {
    STR:  userProfile.strPoints,
    AGI:  userProfile.agiPoints,
    VIT:  userProfile.vitPoints,
    INT:  userProfile.intPoints,
    WIS:  userProfile.wisPoints,
    GOLD: userProfile.goldPoints,
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* ── Page header ──────────────────────────────────────────────────────── */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-[#ededed]">Hunter Profile</h1>
          <span className="label">{tier.rank}-Class</span>
        </div>

        {/* ── Key stats grid ────────────────────────────────────────────────────  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1f1f1f] border border-[#1f1f1f] rounded-lg overflow-hidden">
          {[
            { label: "Total XP",   value: totalXP.toLocaleString() },
            { label: "Playtime",   value: `${totalHours}h ${totalMinsRem}m` },
            { label: "Win Rate",   value: `${winRate}%` },
            { label: "Quests",     value: `${completedQuests}/${totalQuests}` },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-4">
              <p className="label mb-1">{label}</p>
              <p className="text-lg font-semibold text-[#ededed]">{value}</p>
            </div>
          ))}
        </div>


        {/* ── Stat allocation ───────────────────────────────────────────────────  */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#ededed]">Attributes</h2>
            {available > 0 && (
              <span className="text-xs text-[#555]">
                {available} point{available !== 1 ? "s" : ""} to spend
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-px bg-[#1f1f1f] rounded-lg overflow-hidden">
            {CATEGORIES.map((cat) => {
              const pts = userPoints[cat];
              return (
                <div key={cat} className="bg-[#0a0a0a] px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#ededed]">{cat}</p>
                    <p className="text-[10px] text-[#444] mt-0.5 truncate">{STAT_META[cat]?.label}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-[#ededed] tabular-nums w-6 text-right">{pts}</span>
                    {available > 0 ? (
                      <form action={allocateStatPoint}>
                        <input type="hidden" name="statCategory" value={cat} />
                        <button
                          type="submit"
                          className="w-5 h-5 rounded border border-[#1f1f1f] text-[#555] hover:text-[#ededed] hover:border-[#444] flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <div className="w-5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[#333]">+1 point per 5 hours of playtime · 10 awakening bonus</p>
        </div>

        {/* ── System Archives ────────────────────────────────────────────────────  */}
        {logs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#ededed]">Archives</h2>

            {logs.map((log) => {
              const done = log.quests?.filter((q: any) => q.isCompleted).length ?? 0;
              const total = log.quests?.length ?? 0;
              let logMins = 0;
              log.statLogs?.forEach((r: any) => {
                if (r.statCategory !== "VIT") logMins += r.timeTakenMinutes;
              });
              const stRem = Math.max(0, 100 - Math.floor((logMins / 480) * 100));

              return (
                <div key={log.id} className="card space-y-4">
                  {/* Date row */}
                  <div className="flex items-baseline justify-between border-b border-[#171717] pb-3">
                    <p className="text-sm font-medium text-[#ededed]">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "long", month: "short", day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="label">{done}/{total} quests</span>
                      <span className="label">{stRem}% stamina</span>
                    </div>
                  </div>

                  {/* Stat logs */}
                  {log.statLogs?.length > 0 && (
                    <ul className="divide-y divide-[#171717]">
                      {log.statLogs.map((r: any) => {
                        const data = r.reportData || {};
                        return (
                          <li key={r.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="tag">{r.statCategory}</span>
                                {r.statCategory !== "VIT" && (
                                  <span className="text-xs text-[#555] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />{r.timeTakenMinutes}m
                                  </span>
                                )}
                              </div>
                              {r.statCategory === "VIT" ? (
                                <p className="text-xs text-[#888]">
                                  {data.hoursSlept}h · {data.quality}
                                  {data.dietMet && " · Fuel ✓"}
                                </p>
                              ) : (
                                <p className="text-xs text-[#888] truncate">
                                  {data.field1}
                                  {data.field2 && <span className="text-[#444]"> · {data.field2}</span>}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Evening debrief */}
                  {log.eveningDebrief?.content && (
                    <div className="pt-3 border-t border-[#171717] markdown-body">
                      <ReactMarkdown>{log.eveningDebrief.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
