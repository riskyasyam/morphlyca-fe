"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // POST ke endpoint direct login PrimeAuth
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: username,
          password,
          realm_id: process.env.NEXT_PUBLIC_PRIMEAUTH_REALM_ID
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.data?.access_token) {
        throw new Error(data.error || "Login gagal. Cek username/email dan password.");
      }
      // Simpan token jika perlu
      // localStorage.setItem("token", data.data.access_token); // opsional
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
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
      
      <form onSubmit={handleSubmit} className="bg-black-900/50 backdrop-blur-sm border border-slate-900 p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-900 font-bold text-xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Login Manual</h2>
          <p className="text-slate-400">Masuk ke akun Swaplify Anda</p>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username atau Email"
            className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
            value={username}
            onChange={e => setUsername(e.target.value)}
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
        </div>
      </form>
    </div>
  );
}
