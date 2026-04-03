"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", role: "Viewer" });
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    const res = await fetch(`${API()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password, role: form.role }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message || "Registration failed");

    localStorage.setItem("token", data.accessToken);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 brutal-box p-8">
      <h1 className="text-4xl font-black mb-6 uppercase border-b-4 border-brutal-black pb-2">Register</h1>

      {error && (
        <div className="brutal-box p-3 bg-brutal-red text-white font-black uppercase mb-6">{error}</div>
      )}

      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <label className="block font-black text-xl mb-2 uppercase">Email</label>
          <input
            type="email"
            required
            className="brutal-input text-lg"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-black text-xl mb-2 uppercase">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="brutal-input text-lg"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-black text-xl mb-2 uppercase">Confirm Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="brutal-input text-lg"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-black text-xl mb-2 uppercase">Role</label>
          <select
            className="brutal-input text-lg"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="Viewer">Viewer</option>
            <option value="Analyst">Analyst</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="brutal-btn w-full text-xl mt-4">CREATE ACCOUNT</button>
      </form>

      <p className="mt-6 font-bold text-center">
        Already have an account?{" "}
        <button className="underline font-black uppercase" onClick={() => router.push("/")}>
          Login
        </button>
      </p>
    </div>
  );
}
