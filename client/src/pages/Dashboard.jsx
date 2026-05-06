import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import {
  createTask,
  deleteTask,
  getTasks,
  toggleTaskStatus,
  updateTask,
} from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

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
  const [sortBy, setSortBy] = useState("newest");

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    highPriority: 0,
    overdue: 0,
  });

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setIsEditModalOpen(false);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        sort: sortBy,
      };

      if (filter === "pending" || filter === "completed") {
        params.status = filter;
      }

      if (filter === "high") {
        params.priority = "high";
      }

      if (filter === "overdue") {
        params.overdue = true;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await getTasks(params);

      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
      setStats(res.data.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filter, sortBy, searchTerm]);

  useEffect(() => {
    if (!token) return;

    const timer = setTimeout(() => {
      fetchTasks();
    }, 400);

    return () => clearTimeout(timer);
  }, [token, page, filter, sortBy, searchTerm]);

  const handleCreateTask = async (taskData) => {
    try {
      setError("");

      await createTask(taskData);

      toast.success("Task created");
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleToggleTask = async (id) => {
    setActionLoading({ id, type: "toggle" });
    setError("");

    const previousTasks = tasks;

    setTasks((prev) =>
      prev.map((task) =>
        task._id === id
          ? {
              ...task,
              status: task.status === "pending" ? "completed" : "pending",
            }
          : task,
      ),
    );

    try {
      await toggleTaskStatus(id);

      toast.success("Task status updated");
      await fetchTasks();
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || "Failed to update task");
      toast.error(err.response?.data?.message || "Failed to update task");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    setActionLoading({ id, type: "update" });
    setError("");

    try {
      await updateTask(id, taskData);

      toast.success("Task updated");
      await fetchTasks();
      closeEditModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
      toast.error(err.response?.data?.message || "Failed to update task");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleDeleteTask = async (id) => {
    setActionLoading({ id, type: "delete" });
    setError("");

    const previousTasks = tasks;

    setTasks((prev) => prev.filter((task) => task._id !== id));

    try {
      await deleteTask(id);

      toast.success("Task deleted");
      await fetchTasks();
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || "Failed to delete task");
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const taskCounts = {
    all: stats.total,
    pending: stats.pending,
    completed: stats.completed,
  };

  const dashboardStats = [
    {
      label: "Total Tasks",
      value: stats.total,
      filter: "all",
    },
    {
      label: "Pending",
      value: stats.pending,
      filter: "pending",
    },
    {
      label: "Completed",
      value: stats.completed,
      filter: "completed",
    },
    {
      label: "High Priority",
      value: stats.highPriority,
      filter: "high",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      filter: "overdue",
    },
  ];

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => setError(""), 3000);

    return () => clearTimeout(timer);
  }, [error]);

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

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {dashboardStats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => setFilter(stat.filter)}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-indigo-500"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {stat.value}
              </p>
            </button>
          ))}
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="dueDate">Due date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-slate-800"
                  />
                ))}
              </div>
            ) : (
              <>
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                  onEdit={openEditModal}
                  actionLoading={actionLoading}
                />

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrevPage}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <p className="text-sm text-slate-400">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </p>

                    <button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={!pagination.hasNextPage}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdate={handleUpdateTask}
        isLoading={
          actionLoading.id === selectedTask?._id &&
          actionLoading.type === "update"
        }
      />
    </div>
  );
}