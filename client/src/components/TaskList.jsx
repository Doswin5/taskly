import { useState } from "react";

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
  actionLoading,
  filter,
  searchTerm,
}) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditForm({
      title: task.title,
      description: task.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({ title: "", description: "" });
  };

  const submitEdit = async (taskId) => {
    await onUpdate(taskId, editForm);
    cancelEdit();
  };

  if (!tasks.length) {
    const hasSearch = searchTerm?.trim();
    const isFilteredView = filter === "pending" || filter === "completed";

    let message = "";
    let subMessage = "";

    if (hasSearch && isFilteredView) {
      message = `No task including "${searchTerm}" in ${filter} tasks yet`;
    } else if (hasSearch) {
      message = `No task including "${searchTerm}" yet`;
    } else if (isFilteredView) {
      message = `No ${filter} tasks yet`;
    } else {
      message = "No tasks yet";
      subMessage = "Start by creating your first task";
    }

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400 flex flex-col items-center">
        <p className="text-lg font-medium text-white">{message}</p>

        {subMessage && (
          <p className="text-sm text-slate-400 mt-1">{subMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isEditing = editingTaskId === task._id;
        const isLoading =
          actionLoading.id === task._id && actionLoading.type === "update";

        return (
          <div
            key={task._id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />

                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="3"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => submitEdit(task._id)}
                    disabled={isLoading || !editForm.title.trim()}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-800"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={isLoading}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
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
                    onClick={() => startEdit(task)}
                    disabled={isLoading}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const confirmDelete = window.confirm(
                        "Are you sure you want to delete this task?",
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
            )}
          </div>
        );
      })}
    </div>
  );
}
