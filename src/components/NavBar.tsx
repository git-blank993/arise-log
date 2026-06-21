"use client";

import Link from "next/link";
import { logout } from "@/actions/auth";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") return null;

  return (
    <header className="border-b border-[#1f1f1f] sticky top-0 z-50 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-12">
        {/* Brand */}
        <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#ededed]">
          Arise
        </span>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/"
                ? "text-[#ededed] bg-[#1a1a1a]"
                : "text-[#888] hover:text-[#ededed]"
            }`}
          >
            Today
          </Link>
          <Link
            href="/profile"
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/profile"
                ? "text-[#ededed] bg-[#1a1a1a]"
                : "text-[#888] hover:text-[#ededed]"
            }`}
          >
            Profile
          </Link>
        </nav>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-[#555] hover:text-[#ededed] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
