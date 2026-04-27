import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-sm text-slate-300">
          Task Tracker
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Build and manage your tasks with a clean fullstack workflow
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400">
          Register, log in, and manage your tasks from a clean dashboard.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-200 hover:bg-slate-900"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}