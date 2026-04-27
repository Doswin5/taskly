import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-white">
          Task Tracker
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-slate-400 sm:block">
              {user.name}
            </span>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}