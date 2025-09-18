"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePrimeLogin = () => {
    // Ganti URL callback agar diarahkan ke /admin/dashboard setelah login
    const redirectPath = searchParams.get('redirect') || '/admin/dashboard';
    const params = new URLSearchParams({
      redirect_uri: `${window.location.origin}${redirectPath}`
    });
    window.location.href = `http://localhost:3000/auth/prime/login?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Redirect to the intended page or admin dashboard
        const redirectPath = searchParams.get('redirect') || '/admin/dashboard';
        router.push(redirectPath);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      
      {/* Subtle light effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="w-full max-w-md z-10">
        <form onSubmit={handleSubmit} className="bg-black-900/50 backdrop-blur-sm border border-slate-900 p-8 rounded-xl shadow-2xl w-full relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-900 font-bold text-xl">S</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Login Manual</h2>
            <p className="text-slate-400">Masuk ke akun Swaplify Anda</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-400 text-sm bg-red-950/20 border border-red-900/50 rounded-lg p-3">{error}</div>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>
            <button
              type="button"
              onClick={handlePrimeLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login dengan PrimeAuth"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
