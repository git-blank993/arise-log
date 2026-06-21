import { signup } from "@/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-[#555] mb-6">Arise Log</p>
          <h1 className="text-2xl font-semibold text-[#ededed]">Create account</h1>
          <p className="text-sm text-[#888] mt-1">Start your ascent.</p>
        </div>

        <form className="space-y-3" action={signup}>
          <input
            id="username"
            name="username"
            type="text"
            required
            placeholder="Username"
            className="input"
          />
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
            autoComplete="new-password"
            required
            placeholder="Password"
            className="input"
          />
          <button type="submit" className="btn-primary w-full mt-2">
            Create account
          </button>
        </form>

        <p className="text-sm text-[#555]">
          Already a Hunter?{" "}
          <Link href="/login" className="text-[#888] hover:text-[#ededed] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
