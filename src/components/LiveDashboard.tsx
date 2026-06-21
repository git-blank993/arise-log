"use client";

import { initializeDay, addQuest, toggleQuest, deleteQuest, addDungeonReport, deleteDungeonReport, updateSystemNotifications } from "@/actions/logs";
import { Plus, Trash2, CheckCircle, Circle, Info, Clock } from "lucide-react";
import { useState } from "react";

const statCategories = ["STR", "AGI", "VIT", "INT", "WIS", "GOLD"];

const dungeonFields: Record<string, { f1: string, f2: string }> = {
  STR: { f1: "Concept", f2: "Problem Solved" },
  AGI: { f1: "Concept/Module", f2: "Notes" },
  VIT: { f1: "Current Feature Focus", f2: "Bugs Defeated" },
  INT: { f1: "Theory Learned", f2: "Implementation" },
  WIS: { f1: "Paper Title", f2: "Core Mechanic Unlocked" },
  GOLD: { f1: "Task Description", f2: "Impact/Result" },
};

export default function LiveDashboard({ todayLog, totalHistoricalMinutes }: { todayLog: any | null, totalHistoricalMinutes: number }) {
  const [reportStat, setReportStat] = useState<string>("STR");

  if (!todayLog) {
    return (
      <div className="status-panel text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-white">System Standby</h2>
        <p className="text-neutral-400">Initialize the system to begin today's tracking.</p>
        <button onClick={() => initializeDay()} className="rounded-md bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-300">
          Initialize System
        </button>
      </div>
    );
  }

  // Calculate live stamina (Only Dungeon Reports cost stamina now)
  let todayMinutes = 0;
  todayLog.dungeonReports.forEach((r: any) => todayMinutes += r.timeTakenMinutes);

  const staminaUsedPercent = Math.floor((todayMinutes / 480) * 100);
  const staminaRemaining = 100 - staminaUsedPercent;
  const isLimitBreak = staminaRemaining <= 0;

  // Calculate live rank
  const totalHours = (totalHistoricalMinutes + todayMinutes) / 60;
  let currentRank = "E-Class";
  if (totalHours >= 500) currentRank = "S-Class";
  else if (totalHours >= 300) currentRank = "A-Class";
  else if (totalHours >= 150) currentRank = "B-Class";
  else if (totalHours >= 50) currentRank = "C-Class";
  else if (totalHours >= 10) currentRank = "D-Class";

  return (
    <div className="space-y-6">
      {/* System Guide */}
      <div className="status-panel bg-neutral-900/80 border-neutral-700/50 space-y-3">
        <div className="flex items-center text-neutral-200">
          <Info className="w-4 h-4 mr-2" />
          <h2 className="text-sm font-medium">System Guide</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-neutral-300">
          <p><strong className="text-neutral-100">STR:</strong> DSA / Competitive Prog.</p>
          <p><strong className="text-neutral-100">AGI:</strong> Golang Mastery</p>
          <p><strong className="text-neutral-100">VIT:</strong> Full Stack App Dev</p>
          <p><strong className="text-neutral-100">INT:</strong> Machine Learning / CV</p>
          <p><strong className="text-neutral-100">WIS:</strong> AI Research Papers</p>
          <p><strong className="text-neutral-100">GOLD:</strong> Day Job Work</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="status-panel text-center py-4">
          <p className="text-xs text-neutral-500 uppercase">Current Rank</p>
          <p className="text-xl font-bold text-white">{currentRank}</p>
        </div>
        <div className="status-panel text-center py-4">
          <p className="text-xs text-neutral-500 uppercase">Stamina</p>
          {isLimitBreak ? (
            <p className="text-xl font-bold text-purple-400 animate-pulse">LIMIT BREAK ({Math.abs(staminaRemaining)}% Overload)</p>
          ) : (
            <p className="text-xl font-bold text-blue-400">{staminaRemaining}%</p>
          )}
        </div>
      </div>

      {/* Quests Panel */}
      <div className="status-panel space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">Clear Conditions</h2>
          <p className="text-xs text-neutral-400 mt-1">Define your win state for the day.</p>
        </div>

        <ul className="space-y-3">
          {todayLog.quests.map((quest: any) => (
            <li key={quest.id} className={`p-3 rounded-md border ${quest.isCompleted ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-800/50 border-neutral-700'}`}>
              <div className="flex justify-between items-start gap-3">
                <button onClick={() => toggleQuest(quest.id, !quest.isCompleted)} className="mt-0.5 flex-shrink-0">
                  {quest.isCompleted ? <CheckCircle className="w-5 h-5 text-neutral-500" /> : <Circle className="w-5 h-5 text-neutral-400 hover:text-white" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${quest.isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                    <span className="text-xs font-mono text-neutral-500 mr-2">[{quest.statCategory}]</span>
                    {quest.description}
                  </p>
                </div>
                <button onClick={() => deleteQuest(quest.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form action={(data) => addQuest(todayLog.id, data)} className="flex gap-2 pt-2">
          <select name="statCategory" className="rounded-md border-0 bg-neutral-800 py-2 px-2 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm">
            {statCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="text" name="description" required placeholder="Add a new win condition..." className="flex-1 rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
          <button type="submit" className="rounded-md bg-neutral-700 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-600">
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Dungeon Reports Panel */}
      <div className="status-panel space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">Dungeon Reports</h2>
          <p className="text-xs text-neutral-400 mt-1">Active grinding and deep work sessions.</p>
        </div>

        <ul className="space-y-3">
          {todayLog.dungeonReports.map((report: any) => {
            const data = report.reportData || {};
            const fields = dungeonFields[report.statCategory] || { f1: "Field 1", f2: "Field 2" };
            return (
              <li key={report.id} className="p-3 rounded-md bg-neutral-800/50 border border-neutral-700 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-neutral-900 rounded text-neutral-400 border border-neutral-700">[{report.statCategory}]</span>
                    <span className="text-neutral-500 text-xs flex items-center"><Clock className="w-3 h-3 mr-1" /> {report.timeTakenMinutes}m</span>
                  </div>
                  <p className="text-sm text-neutral-200 mt-1"><span className="text-neutral-500 font-medium text-xs">{fields.f1}:</span> {data.field1}</p>
                  <p className="text-sm text-neutral-200"><span className="text-neutral-500 font-medium text-xs">{fields.f2}:</span> {data.field2}</p>
                </div>
                <button onClick={() => deleteDungeonReport(report.id)} className="text-neutral-600 hover:text-red-400 transition-colors mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>

        <form action={(formData) => {
            const fd = new FormData();
            fd.append("statCategory", formData.get("statCategory") as string);
            fd.append("timeTakenMinutes", formData.get("timeTakenMinutes") as string);
            fd.append("reportData", JSON.stringify({
              field1: formData.get("field1"),
              field2: formData.get("field2")
            }));
            addDungeonReport(todayLog.id, fd);
          }} className="space-y-3 pt-4 border-t border-neutral-800">
          <div className="flex gap-2">
            <select name="statCategory" value={reportStat} onChange={(e) => setReportStat(e.target.value)} className="rounded-md border-0 bg-neutral-800 py-2 px-2 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm">
              {statCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" name="timeTakenMinutes" required placeholder="Time (min)" className="w-24 rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">{dungeonFields[reportStat]?.f1 || "Concept"}</label>
              <input type="text" name="field1" required className="block w-full rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">{dungeonFields[reportStat]?.f2 || "Details"}</label>
              <input type="text" name="field2" required className="block w-full rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-600">
              Log Session
            </button>
          </div>
        </form>
      </div>

      {/* Evening Debrief */}
      <div className="status-panel space-y-4">
        <div>
          <h2 className="text-lg font-medium text-white">Evening Debrief</h2>
          <p className="text-xs text-neutral-400 mt-1">Reflect on today's performance.</p>
        </div>
        <form action={(data) => updateSystemNotifications(todayLog.id, data)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Level Up Moment</label>
            <input type="text" name="levelUpMoment" defaultValue={todayLog.systemNotification?.levelUpMoment || ""} placeholder="What felt like a level up today?" className="block w-full rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Debuffs Taken</label>
              <input type="text" name="debuffsTaken" defaultValue={todayLog.systemNotification?.debuffsTaken || ""} placeholder="Distractions/obstacles" className="block w-full rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Next Day Objective</label>
              <input type="text" name="nextDayObjective" defaultValue={todayLog.systemNotification?.nextDayObjective || ""} placeholder="Main quest for tomorrow" className="block w-full rounded-md border-0 bg-neutral-800 py-2 px-3 text-white ring-1 ring-inset ring-neutral-700 sm:text-sm" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-300">
              Save Debrief
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
