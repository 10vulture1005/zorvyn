"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('hash');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.accessToken);
        router.push('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 brutal-box p-8">
      <h1 className="text-4xl font-black mb-6 uppercase border-b-4 border-brutal-black pb-2">Login</h1>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block font-black text-xl mb-2 uppercase">Email Context</label>
          <input 
            type="email" 
            className="brutal-input text-lg" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-black text-xl mb-2 uppercase">Secret Key</label>
          <input 
            type="password" 
            className="brutal-input text-lg" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="brutal-btn w-full text-xl mt-4">ENGAGE</button>
      </form>
    </div>
  );
}
