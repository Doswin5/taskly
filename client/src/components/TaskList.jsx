import { useState } from "react";

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  actionLoading,
}) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400 flex flex-col items-center">
        <p className="text-lg font-medium text-white">No tasks found</p>
        <p className="text-sm text-slate-400 mt-1">
          Try changing filters or create a new task
        </p>
      </div>
    );
  }

  const getPriorityClass = (priority) => {
    if (priority === "high") {
      return "border-red-900 bg-red-950 text-red-300";
    }

    if (priority === "low") {
      return "border-emerald-900 bg-emerald-950 text-emerald-300";
    }

    return "border-amber-900 bg-amber-950 text-amber-300";
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isLoading =
          actionLoading.id === task._id &&
          actionLoading.type === "update";

        return (
          <div
            key={task._id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    task.status === "completed"
                      ? "text-slate-500 line-through"
                      : "text-white"
                  }`}
                >
                  {task.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {task.description || "No description"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded-full border px-3 py-1 ${getPriorityClass(
                      task.priority
                    )}`}
                  >
                    Priority: {task.priority || "medium"}
                  </span>

                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
                    Category: {task.category || "General"}
                  </span>

                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
                    Due:{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No date"}
                  </span>
                </div>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    task.status === "completed"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-900"
                      : "bg-amber-950 text-amber-300 border border-amber-900"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onToggle(task._id)}
                  disabled={
                    actionLoading.id === task._id &&
                    actionLoading.type === "toggle"
                  }
                  className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
                >
                  {actionLoading.id === task._id &&
                  actionLoading.type === "toggle"
                    ? "Updating..."
                    : task.status === "completed"
                    ? "Mark pending"
                    : "Complete"}
                </button>

                <button
                  onClick={() => onEdit(task)}
                  disabled={isLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:cursor-not-allowed"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    const confirmDelete = window.confirm(
                      "Are you sure you want to delete this task?"
                    );

                    if (confirmDelete) {
                      onDelete(task._id);
                    }
                  }}
                  disabled={
                    actionLoading.id === task._id &&
                    actionLoading.type === "delete"
                  }
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
                >
                  {actionLoading.id === task._id &&
                  actionLoading.type === "delete"
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}