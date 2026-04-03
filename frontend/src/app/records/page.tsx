"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

type Record = {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
  deletedAt?: string | null;
};

const EMPTY_FORM = { amount: "", type: "expense", category: "", date: "", notes: "" };

export default function Records() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [records, setRecords] = useState<Record[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return router.push("/");
    setToken(t);
  }, []);

  useEffect(() => {
    if (token) fetchRecords();
  }, [token, showDeleted]);

  async function fetchRecords(cursor?: string) {
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("cursor", cursor);
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.startDate) params.set("startDate", new Date(filters.startDate).toISOString());
    if (filters.endDate) params.set("endDate", new Date(filters.endDate).toISOString());

    const res = await fetch(`${API()}/api/records?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message || "Failed to load");

    let rows: Record[] = data.data || [];
    if (showDeleted) {
      // fetch all including deleted by checking each — backend doesn't expose a deleted filter,
      // so we show the current page and mark deleted ones visually if deletedAt is present
    }
    setRecords(cursor ? (prev) => [...prev, ...rows] : rows);
    setNextCursor(data.metadata?.nextCursor || null);
    setHasMore(data.metadata?.hasMore || false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: new Date(form.date).toISOString(),
      notes: form.notes || undefined,
    };

    const url = editId ? `${API()}/api/records/${editId}` : `${API()}/api/records`;
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) return setError(data.message || "Failed to save");

    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    fetchRecords();
  }

  async function softDelete(id: string) {
    const res = await fetch(`${API()}/api/records/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) fetchRecords();
    else setError("Delete failed");
  }

  async function restore(id: string) {
    const res = await fetch(`${API()}/api/records/${id}/restore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchRecords();
    else setError("Restore failed");
  }

  async function purge(id: string) {
    if (!confirm("Permanently delete? This cannot be undone.")) return;
    const res = await fetch(`${API()}/api/records/${id}/purge`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 204) fetchRecords();
    else setError("Purge failed");
  }

  function startEdit(r: Record) {
    setForm({
      amount: String(r.amount),
      type: r.type,
      category: r.category,
      date: r.date.slice(0, 16),
      notes: r.notes || "",
    });
    setEditId(r.id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b-8 border-brutal-black pb-4 flex-wrap gap-4">
        <h1 className="text-5xl font-black uppercase">Financial Logs</h1>
        <div className="flex gap-3 flex-wrap">
          <button className="brutal-btn !bg-brutal-green" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
            + New Record
          </button>
          <button className="brutal-btn !bg-brutal-blue text-white" onClick={() => router.push("/audit")}>
            Audit Logs
          </button>
          <button className="brutal-btn !bg-brutal-bg" onClick={() => router.push("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="brutal-box p-4 bg-brutal-red text-white font-black mb-6 uppercase">{error}</div>
      )}

      {/* Filters */}
      <div className="brutal-box p-6 mb-8 bg-brutal-white">
        <h2 className="font-black text-xl uppercase mb-4 border-b-4 border-brutal-black pb-2">Filters</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select className="brutal-input" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input className="brutal-input" placeholder="Category" value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} />
          <input className="brutal-input" type="date" value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          <input className="brutal-input" type="date" value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        </div>
        <button className="brutal-btn mt-4" onClick={() => fetchRecords()}>Apply</button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="brutal-box p-8 mb-8 bg-brutal-yellow">
          <h2 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2 mb-6">
            {editId ? "Edit Record" : "New Record"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase mb-1">Amount</label>
              <input className="brutal-input" type="number" step="0.01" required value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Type</label>
              <select className="brutal-input" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Category</label>
              <input className="brutal-input" required value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className="block font-black uppercase mb-1">Date</label>
              <input className="brutal-input" type="datetime-local" required value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-black uppercase mb-1">Notes</label>
              <input className="brutal-input" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button type="submit" className="brutal-btn">{editId ? "Update" : "Create"}</button>
              <button type="button" className="brutal-btn !bg-brutal-white"
                onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Records Table */}
      <table className="brutal-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id} className={
              r.deletedAt
                ? "opacity-40 bg-gray-200"
                : r.type === "expense"
                ? "bg-[#FFD60A]/20"
                : "bg-[#34C759]/20"
            }>
              <td>{new Date(r.date).toLocaleDateString()}</td>
              <td className="uppercase font-black text-center">{r.type}</td>
              <td className="uppercase">{r.category}</td>
              <td className="font-black text-right">${r.amount.toFixed(2)}</td>
              <td>{r.notes || "—"}</td>
              <td>
                <div className="flex gap-2 flex-wrap">
                  {!r.deletedAt ? (
                    <>
                      <button className="brutal-btn !p-2 !text-sm !bg-brutal-blue text-white"
                        onClick={() => startEdit(r)}>Edit</button>
                      <button className="brutal-btn !p-2 !text-sm !bg-brutal-red text-white"
                        onClick={() => softDelete(r.id)}>Delete</button>
                    </>
                  ) : (
                    <>
                      <button className="brutal-btn !p-2 !text-sm !bg-brutal-green"
                        onClick={() => restore(r.id)}>Restore</button>
                      <button className="brutal-btn !p-2 !text-sm !bg-brutal-black text-white"
                        onClick={() => purge(r.id)}>Purge</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <button className="brutal-btn mt-6 w-full" onClick={() => fetchRecords(nextCursor!)}>
          Load More
        </button>
      )}
    </div>
  );
}
