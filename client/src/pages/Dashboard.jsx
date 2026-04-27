import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import {
  createTask,
  deleteTask,
  getTasks,
  toggleTaskStatus,
  updateTask,
} from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import { useMemo } from "react";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filter === "pending") {
      result = result.filter((task) => task.status === "pending");
    }

    if (filter === "completed") {
      result = result.filter((task) => task.status === "completed");
    }

    if (searchTerm.trim()) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result;
  }, [tasks, filter, searchTerm]);

  const fetchTasks = async () => {
    try {
      setError("");
      const res = await getTasks(token);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleCreateTask = async (taskData) => {
    try {
      const res = await createTask(taskData, token);
      setTasks((prev) => [res.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleToggleTask = async (id) => {
    setActionLoading({ id, type: "toggle" });
    setError("");

    try {
      const res = await toggleTaskStatus(id, token);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? res.data : task)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    setActionLoading({ id, type: "update" });
    setError("");
    try {
      const res = await updateTask(id, taskData, token);

      setTasks((prev) =>
        prev.map((task) => (task._id === id ? res.data : task)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleDeleteTask = async (id) => {
    setActionLoading({ id, type: "delete" });
    setError("");

    try {
      await deleteTask(id, token);
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="mt-2 text-slate-400">
              Manage your tasks from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "pending", "completed"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2 text-sm capitalize ${
                  filter === item
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-700 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {item} ({taskCounts[item]})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button
              onClick={fetchTasks}
              className="rounded-lg border border-red-800 px-3 py-1 text-xs hover:bg-red-900"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <TaskForm onCreate={handleCreateTask} />

          <div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
                Loading tasks...
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onUpdate={handleUpdateTask}
                actionLoading={actionLoading}
                filter={filter}
                searchTerm={searchTerm}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
