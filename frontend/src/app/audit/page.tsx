"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  timestamp: string;
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-brutal-green",
  update: "bg-brutal-blue text-white",
  soft_delete: "bg-brutal-red text-white",
  restore: "bg-brutal-yellow",
  purge: "bg-brutal-black text-white",
};

export default function AuditLogs() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({ userId: "", entityId: "", limit: "50" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return router.push("/");
    setToken(t);
  }, []);

  useEffect(() => {
    if (token) fetchLogs();
  }, [token]);

  async function fetchLogs() {
    setError("");
    const params = new URLSearchParams({ limit: filters.limit });
    if (filters.userId) params.set("userId", filters.userId);
    if (filters.entityId) params.set("entityId", filters.entityId);

    const res = await fetch(`${API()}/api/audit?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message || "Failed to load audit logs");
    setLogs(data);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b-8 border-brutal-black pb-4 flex-wrap gap-4">
        <h1 className="text-5xl font-black uppercase">Audit Logs</h1>
        <button className="brutal-btn !bg-brutal-bg" onClick={() => router.push("/records")}>
          ← Records
        </button>
      </div>

      {error && (
        <div className="brutal-box p-4 bg-brutal-red text-white font-black mb-6 uppercase">{error}</div>
      )}

      <div className="brutal-box p-6 mb-8 bg-brutal-white">
        <h2 className="font-black text-xl uppercase mb-4 border-b-4 border-brutal-black pb-2">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-black uppercase mb-1">User ID</label>
            <input className="brutal-input" placeholder="Filter by user ID" value={filters.userId}
              onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} />
          </div>
          <div>
            <label className="block font-black uppercase mb-1">Entity ID</label>
            <input className="brutal-input" placeholder="Filter by record ID" value={filters.entityId}
              onChange={e => setFilters(f => ({ ...f, entityId: e.target.value }))} />
          </div>
          <div>
            <label className="block font-black uppercase mb-1">Limit</label>
            <input className="brutal-input" type="number" value={filters.limit}
              onChange={e => setFilters(f => ({ ...f, limit: e.target.value }))} />
          </div>
        </div>
        <button className="brutal-btn mt-4" onClick={fetchLogs}>Apply</button>
      </div>

      <div className="space-y-3">
        {logs.length === 0 && (
          <div className="brutal-box p-6 font-black uppercase text-center">No audit logs found</div>
        )}
        {logs.map(log => (
          <div key={log.id} className="brutal-box bg-brutal-white">
            <div
              className="flex items-center justify-between p-4 cursor-pointer flex-wrap gap-2"
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`brutal-btn !p-2 !text-sm pointer-events-none ${ACTION_COLORS[log.action] || "bg-brutal-white"}`}>
                  {log.action.toUpperCase()}
                </span>
                <span className="font-black uppercase">{log.entityType}</span>
                <span className="font-mono text-sm truncate max-w-[200px]">{log.entityId}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="font-black">{expanded === log.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {expanded === log.id && (
              <div className="border-t-4 border-brutal-black p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-black uppercase mb-1">User ID</p>
                  <p className="font-mono text-sm break-all">{log.userId}</p>
                </div>
                <div>
                  <p className="font-black uppercase mb-1">Entity ID</p>
                  <p className="font-mono text-sm break-all">{log.entityId}</p>
                </div>
                <div>
                  <p className="font-black uppercase mb-2 border-b-2 border-brutal-black pb-1">Before</p>
                  <pre className="text-xs bg-brutal-bg p-3 border-2 border-brutal-black overflow-auto max-h-48">
                    {log.before ? JSON.stringify(log.before, null, 2) : "null"}
                  </pre>
                </div>
                <div>
                  <p className="font-black uppercase mb-2 border-b-2 border-brutal-black pb-1">After</p>
                  <pre className="text-xs bg-brutal-bg p-3 border-2 border-brutal-black overflow-auto max-h-48">
                    {log.after ? JSON.stringify(log.after, null, 2) : "null"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
