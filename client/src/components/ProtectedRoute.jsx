import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}