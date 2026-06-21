import { login } from "@/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 status-panel">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            System Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 bg-neutral-800 py-2.5 px-3 text-neutral-100 ring-1 ring-inset ring-neutral-700 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-neutral-500 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 bg-neutral-800 py-2.5 px-3 text-neutral-100 ring-1 ring-inset ring-neutral-700 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-neutral-500 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-neutral-100 px-3 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 transition-colors"
            >
              Sign in
            </button>
          </div>
          
          <div className="text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-neutral-200 hover:text-white">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
