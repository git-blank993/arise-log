"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// The shortcuts list for the Help overlay
export const SHORTCUTS = [
  { keys: ["?"], description: "Show Keyboard Shortcuts" },
  { keys: ["g", "d"], description: "Go to Dashboard" },
  { keys: ["g", "p"], description: "Go to Profile" },
  { keys: ["["], description: "Previous Day (Dashboard)" },
  { keys: ["]"], description: "Next Day (Dashboard)" },
  { keys: ["1", "-", "7"], description: "Switch Stat Tabs" },
  { keys: ["n"], description: "Focus New Activity Log" },
  { keys: ["c"], description: "Focus Clear Conditions" },
  { keys: ["e"], description: "Focus Evening Debrief" },
  { keys: ["Esc"], description: "Unfocus / Close Modal" },
];

export function KeyboardManager() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let lastKey = "";
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape") {
          target.blur(); // Blur the input on Escape
        }
        return;
      }

      // Help Modal Toggle (?)
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((s) => !s);
        return;
      }

      if (e.key === "Escape" && showHelp) {
        setShowHelp(false);
        return;
      }

      // 'g' sequence handling
      if (e.key === "g") {
        lastKey = "g";
        clearTimeout(timeout);
        timeout = setTimeout(() => { lastKey = ""; }, 1000);
        return;
      }

      if (lastKey === "g") {
        if (e.key === "d") {
          e.preventDefault();
          router.push("/");
          lastKey = "";
        } else if (e.key === "p") {
          e.preventDefault();
          router.push("/profile");
          lastKey = "";
        } else {
          // Reset if it was a different key
          lastKey = "";
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showHelp]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setShowHelp(false)} />
      
      <div className="relative bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <h2 className="text-xl font-semibold text-[#ededed] mb-1">Keyboard Shortcuts</h2>
        <p className="text-sm text-[#888] mb-6">Navigate and log purely via keyboard.</p>

        <ul className="space-y-3">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="text-sm text-[#888]">{s.description}</span>
              <div className="flex gap-1.5">
                {s.keys.map((k, j) => (
                  <kbd key={j} className="px-2 py-1 bg-[#161616] border border-[#2a2a2a] rounded-md text-xs font-mono text-[#ededed] shadow-sm">
                    {k}
                  </kbd>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center border-t border-[#1f1f1f] pt-4">
          <button onClick={() => setShowHelp(false)} className="btn-secondary text-xs">
            Close Modal (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
