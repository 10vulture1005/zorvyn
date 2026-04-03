"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Summary = {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  topCategories: { category: string; total: number }[];
  monthlyTrends: Record<string, { income: number; expense: number }>;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/");

    fetch(`${API()}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) setError(data.message);
        else setSummary(data);
      })
      .catch(() => setError("Failed to load dashboard"));
  }, []);

  if (error) return <div className="brutal-box p-6 bg-brutal-red text-white font-black uppercase">{error}</div>;
  if (!summary) return <div className="text-4xl font-black uppercase">Loading...</div>;

  const sortedMonths = Object.entries(summary.monthlyTrends).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b-8 border-brutal-black pb-4 flex-wrap gap-4">
        <h1 className="text-5xl font-black uppercase">Overview</h1>
        <div className="flex gap-3 flex-wrap">
          <button className="brutal-btn" onClick={() => router.push("/records")}>Records Logs</button>
          <button className="brutal-btn !bg-brutal-blue text-white" onClick={() => router.push("/audit")}>Audit Logs</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="brutal-box p-6 bg-brutal-green">
          <h2 className="text-2xl font-black uppercase mb-2">Total Income</h2>
          <p className="text-5xl font-black">${summary.totalIncome.toFixed(2)}</p>
        </div>
        <div className="brutal-box p-6 bg-brutal-red text-brutal-white">
          <h2 className="text-2xl font-black uppercase mb-2">Total Expenses</h2>
          <p className="text-5xl font-black">${summary.totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`brutal-box p-6 ${summary.netBalance >= 0 ? "bg-brutal-blue text-brutal-white" : "bg-brutal-black text-brutal-white"}`}>
          <h2 className="text-2xl font-black uppercase mb-2">Net Balance</h2>
          <p className="text-5xl font-black">${summary.netBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Categories */}
        <div className="brutal-box p-8 bg-brutal-yellow">
          <h2 className="text-3xl font-black uppercase border-b-4 border-brutal-black pb-2 mb-6">Top Spends</h2>
          {summary.topCategories.length === 0 ? (
            <p className="font-bold uppercase">No data</p>
          ) : (
            <div className="space-y-4">
              {summary.topCategories.map(c => (
                <div key={c.category} className="flex justify-between items-center bg-brutal-white border-4 border-brutal-black p-4 text-xl font-bold">
                  <span className="uppercase">{c.category}</span>
                  <span>${c.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="brutal-box p-8 bg-brutal-white">
          <h2 className="text-3xl font-black uppercase border-b-4 border-brutal-black pb-2 mb-6">Monthly Trends</h2>
          {sortedMonths.length === 0 ? (
            <p className="font-bold uppercase">No data</p>
          ) : (
            <table className="brutal-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonths.map(([month, vals]) => {
                  const net = vals.income - vals.expense;
                  return (
                    <tr key={month} className={net >= 0 ? "bg-[#34C759]/20" : "bg-[#FF3B30]/20"}>
                      <td className="font-black">{month}</td>
                      <td className="text-right">${vals.income.toFixed(2)}</td>
                      <td className="text-right">${vals.expense.toFixed(2)}</td>
                      <td className={`text-right font-black ${net >= 0 ? "text-brutal-green" : "text-brutal-red"}`}>
                        ${net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
