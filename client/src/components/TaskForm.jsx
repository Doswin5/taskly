import { useState } from "react";

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setLoading(true);
    await onCreate({ title, description });
    setTitle("");
    setDescription("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
    >
      <h3 className="text-lg font-semibold text-white">Create task</h3>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
        <textarea
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-800"
        >
          {loading ? "Creating..." : "Add task"}
        </button>
      </div>
    </form>
  );
}