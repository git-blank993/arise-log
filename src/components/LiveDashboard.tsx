"use client";

import {
  initializeDay,
  addQuest,
  toggleQuest,
  deleteQuest,
  addStatLog,
  deleteStatLog,
  updateEveningDebrief,
} from "@/actions/logs";
import ReactMarkdown from "react-markdown";
import { Plus, Trash2, CheckCircle, Circle, Loader2, ChevronDown } from "lucide-react";
import { useState, useTransition, useRef, useEffect } from "react";
import { SubmitButton } from "./SubmitButton";

// ── Custom Select ─────────────────────────────────────────────────────────────
function CustomSelect({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-full px-3 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md text-xs font-medium text-[#ededed] hover:border-[#333] transition-colors select-none"
      >
        {value}
        <ChevronDown
          className={`w-3 h-3 text-[#555] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-full bg-[#111] border border-[#1f1f1f] rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.6)] overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                opt === value
                  ? "text-[#ededed] bg-[#1a1a1a]"
                  : "text-[#888] hover:text-[#ededed] hover:bg-[#161616]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const STAT_TABS = ["STR", "AGI", "INT", "WIS", "GOLD", "VIT"] as const;
type Stat = (typeof STAT_TABS)[number];

const STAT_META: Record<Stat, { label: string; f1: string; f2: string; isRecovery?: boolean }> = {
  STR:  { label: "Physical Training",   f1: "Exercise",      f2: "Intensity / PRs" },
  AGI:  { label: "Mental Agility",      f1: "Algorithm / DSA", f2: "Concept" },
  INT:  { label: "Deep Learning",       f1: "Topic / Paper", f2: "Takeaways" },
  WIS:  { label: "Architecture",        f1: "Project",       f2: "Feature / Bugs" },
  GOLD: { label: "Career",              f1: "Task",          f2: "Impact" },
  VIT:  { label: "Recovery",            f1: "",              f2: "", isRecovery: true },
};

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];

function formatMins(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

export default function LiveDashboard({
  todayLog,
  totalHistoricalMinutes,
}: {
  todayLog: any | null;
  totalHistoricalMinutes: number;
}) {
  const [activeTab, setActiveTab] = useState<Stat>("STR");
  const [timeTaken, setTimeTaken] = useState<number | "">(30);
  const [questStat, setQuestStat] = useState<string>("STR");
  const [isPending, startTransition] = useTransition();

  // ── Not initialized ──────────────────────────────────────────────────────────
  if (!todayLog) {
    return (
      <div className="card text-center py-16 space-y-4">
        <p className="label">System Standby</p>
        <h2 className="text-lg font-semibold text-[#ededed]">No log for today</h2>
        <p className="text-sm text-[#555]">Initialize the system to begin tracking.</p>
        <button
          onClick={() => startTransition(() => { initializeDay(); })}
          disabled={isPending}
          className="btn-primary mt-2 gap-2"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Initialize
        </button>
      </div>
    );
  }

  // ── Stamina ───────────────────────────────────────────────────────────────────
  let todayMinutes = 0;
  todayLog.statLogs?.forEach((r: any) => {
    if (r.statCategory !== "VIT") todayMinutes += r.timeTakenMinutes;
  });
  const staminaUsedPct = Math.min(Math.floor((todayMinutes / 480) * 100), 999);
  const staminaRemaining = 100 - staminaUsedPct;
  const isLimitBreak = staminaRemaining <= 0;

  // ── Rank proxy ────────────────────────────────────────────────────────────────
  const totalHours = (totalHistoricalMinutes + todayMinutes) / 60;
  let rank = "E";
  if (totalHours >= 500) rank = "S";
  else if (totalHours >= 300) rank = "A";
  else if (totalHours >= 150) rank = "B";
  else if (totalHours >= 50) rank = "C";
  else if (totalHours >= 10) rank = "D";

  const meta = STAT_META[activeTab];

  return (
    <div className="space-y-3">

      {/* ── Stats row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-[#1f1f1f] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <div className="px-5 py-4">
          <p className="label mb-1">Rank</p>
          <p className="text-xl font-semibold text-[#ededed]">{rank}-Class</p>
        </div>
        <div className="px-5 py-4">
          <p className="label mb-1">Stamina</p>
          {isLimitBreak ? (
            <p className="text-xl font-semibold text-[#ededed]">Limit Break</p>
          ) : (
            <p className="text-xl font-semibold text-[#ededed]">{staminaRemaining}%</p>
          )}
        </div>
      </div>

      {/* ── Quests ────────────────────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-[#ededed]">Clear Conditions</h2>
          <span className="label">
            {todayLog.quests?.filter((q: any) => q.isCompleted).length ?? 0}
            {" / "}
            {todayLog.quests?.length ?? 0}
          </span>
        </div>

        {/* Quest list */}
        {todayLog.quests?.length > 0 && (
          <ul className="divide-y divide-[#171717]">
            {todayLog.quests.map((quest: any) => (
              <li key={quest.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => toggleQuest(quest.id, !quest.isCompleted))}
                  className="mt-0.5 shrink-0 text-[#555] hover:text-[#ededed] disabled:opacity-40 transition-colors"
                >
                  {quest.isCompleted
                    ? <CheckCircle className="w-4 h-4 text-[#888]" />
                    : <Circle className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${quest.isCompleted ? "text-[#444] line-through" : "text-[#ededed]"}`}>
                    {quest.description}
                  </p>
                  <span className="tag mt-1">{quest.statCategory}</span>
                </div>
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteQuest(quest.id))}
                  className="shrink-0 text-[#333] hover:text-[#f44] disabled:opacity-40 transition-colors mt-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add quest form */}
        <form action={(data) => addQuest(todayLog.id, data)} className="flex gap-2 pt-1">
          <CustomSelect
            options={STAT_TABS}
            value={questStat}
            onChange={setQuestStat}
            name="statCategory"
          />
          <input
            type="text"
            name="description"
            required
            placeholder="Add a clear condition..."
            className="flex-1 min-w-0 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md px-3 py-2 text-sm text-[#ededed] placeholder:text-[#333] outline-none hover:border-[#333] focus:border-[#444] transition-colors"
          />
          <SubmitButton className="btn-secondary px-3 py-2">
            <Plus className="w-4 h-4" />
          </SubmitButton>
        </form>
      </div>

      {/* ── Activity Log ─────────────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold text-[#ededed]">Activity Log</h2>

        {/* Logged sessions */}
        {todayLog.statLogs?.length > 0 && (
          <ul className="divide-y divide-[#171717]">
            {todayLog.statLogs.map((r: any) => {
              const data = r.reportData || {};
              const m = STAT_META[r.statCategory as Stat];
              return (
                <li key={r.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="tag">{r.statCategory}</span>
                      {r.statCategory !== "VIT" && (
                        <span className="text-xs text-[#555]">{r.timeTakenMinutes}m</span>
                      )}
                    </div>
                    {r.statCategory === "VIT" ? (
                      <p className="text-sm text-[#888]">
                        {data.hoursSlept}h sleep · {data.quality}
                        {data.dietMet && " · Fuel ✓"}
                      </p>
                    ) : (
                      <p className="text-sm text-[#888] truncate">
                        {data.field1}
                        {data.field2 ? <span className="text-[#444]"> · {data.field2}</span> : null}
                      </p>
                    )}
                  </div>
                  <button
                    disabled={isPending}
                    onClick={() => startTransition(() => deleteStatLog(r.id))}
                    className="shrink-0 text-[#333] hover:text-[#f44] disabled:opacity-40 transition-colors mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Stat tabs + form */}
        <div className="border border-[#1f1f1f] rounded-lg overflow-hidden">
          {/* Tab row */}
          <div className="flex border-b border-[#1f1f1f] overflow-x-auto no-scrollbar">
            {STAT_TABS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`flex-1 min-w-[48px] py-2.5 text-xs font-medium transition-colors ${
                  activeTab === cat
                    ? "text-[#ededed] bg-[#161616] border-b border-[#ededed]"
                    : "text-[#555] hover:text-[#888]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Form body */}
          <form
            action={(formData) => {
              const fd = new FormData();
              fd.append("statCategory", activeTab);
              if (activeTab === "VIT") {
                fd.append("timeTakenMinutes", "0");
                fd.append("reportData", JSON.stringify({
                  hoursSlept: formData.get("hoursSlept"),
                  quality: formData.get("quality"),
                  dietMet: formData.get("dietMet") === "on",
                }));
              } else {
                fd.append("timeTakenMinutes", String(timeTaken || 0));
                fd.append("reportData", JSON.stringify({
                  field1: formData.get("field1"),
                  field2: formData.get("field2"),
                }));
              }
              addStatLog(todayLog.id, fd);
              setTimeTaken(30);
            }}
            className="p-4 space-y-4"
          >
            {/* Sub-label */}
            <p className="label">{meta.label}</p>

            {activeTab === "VIT" ? (
              /* VIT form */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1">Hours slept</label>
                    <input
                      type="number"
                      step="0.5"
                      name="hoursSlept"
                      required
                      placeholder="7.5"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label block mb-1">Quality</label>
                    <select name="quality" className="input">
                      <option>Poor</option>
                      <option>Fair</option>
                      <option>Good</option>
                      <option>Excellent</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="dietMet"
                    className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] accent-[#ededed]"
                  />
                  <span className="text-sm text-[#888]">Hit hydration & diet goals</span>
                </label>
              </div>
            ) : (
              /* Standard form */
              <div className="space-y-3">
                {/* Time presets */}
                <div>
                  <label className="label block mb-2">Time spent</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTimeTaken(m)}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                          timeTaken === m
                            ? "border-[#ededed] text-[#ededed] bg-[#1a1a1a]"
                            : "border-[#1f1f1f] text-[#555] hover:border-[#333] hover:text-[#888]"
                        }`}
                      >
                        {formatMins(m)}
                      </button>
                    ))}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Custom"
                        value={!TIME_PRESETS.includes(timeTaken as number) ? timeTaken : ""}
                        onChange={(e) => setTimeTaken(parseInt(e.target.value) || "")}
                        className={`w-20 px-3 pr-6 py-1.5 text-xs rounded-md border bg-[#0a0a0a] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none ${
                          !TIME_PRESETS.includes(timeTaken as number) && timeTaken !== ""
                            ? "border-[#ededed] text-[#ededed]"
                            : "border-[#1f1f1f] text-[#555] placeholder:text-[#333]"
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#555] pointer-events-none">m</span>
                    </div>
                  </div>
                </div>

                {/* Custom fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label block mb-1">{meta.f1}</label>
                    <input type="text" name="field1" required className="input" />
                  </div>
                  <div>
                    <label className="label block mb-1">{meta.f2}</label>
                    <input type="text" name="field2" className="input" />
                  </div>
                </div>
              </div>
            )}

            <SubmitButton
              pendingText="Logging..."
              className="btn-primary text-xs px-4 py-2"
            >
              Log {activeTab}
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* ── Evening Debrief ───────────────────────────────────────────────────── */}
      <EveningDebriefEditor
        logId={todayLog.id}
        initialContent={
          todayLog.eveningDebrief?.content ||
          "### Level Up Moment\n\n\n### Debuffs Taken\n\n\n### Next Day Objective\n\n\n"
        }
      />
    </div>
  );
}

// ── Evening Debrief Editor with live preview ────────────────────────────────
function EveningDebriefEditor({
  logId,
  initialContent,
}: {
  logId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#ededed]">Evening Debrief</h2>
        {/* Write / Preview toggle */}
        <div className="flex gap-0.5 p-0.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs rounded transition-colors capitalize ${
                tab === t
                  ? "bg-[#1a1a1a] text-[#ededed]"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "write" ? (
        <form
          action={(data) => updateEveningDebrief(logId, data)}
          className="space-y-3"
        >
          <textarea
            name="content"
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-md px-3 py-2.5 text-sm text-[#ededed] placeholder:text-[#333] outline-none hover:border-[#333] focus:border-[#444] transition-colors font-mono leading-relaxed resize-none"
            placeholder="Start writing..."
          />
          <div className="flex justify-end">
            <SubmitButton pendingText="Saving..." className="btn-secondary text-xs px-4 py-2">
              Save
            </SubmitButton>
          </div>
        </form>
      ) : (
        <div className="min-h-[240px] border border-[#1f1f1f] rounded-md px-4 py-3 prose prose-invert prose-sm max-w-none prose-h3:text-xs prose-h3:font-semibold prose-h3:text-[#888] prose-h3:uppercase prose-h3:tracking-widest prose-h3:mb-2 prose-p:text-[#888] prose-p:text-sm prose-p:mt-0 prose-p:mb-3 last:prose-p:mb-0">
          {content.trim() ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-[#333] text-sm italic">Nothing written yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
