import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-[#555] mb-6">Arise Log</p>
          <h1 className="text-2xl font-semibold text-[#ededed]">Sign in</h1>
          <p className="text-sm text-[#888] mt-1">Continue your journey.</p>
        </div>

        <form className="space-y-3" action={login}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            className="input"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            className="input"
          />
          <button type="submit" className="btn-primary w-full mt-2">
            Sign in
          </button>
        </form>

        <p className="text-sm text-[#555]">
          No account?{" "}
          <Link href="/signup" className="text-[#888] hover:text-[#ededed] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
