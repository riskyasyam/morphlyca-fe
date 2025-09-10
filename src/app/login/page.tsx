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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-96 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4">Login Manual</h2>
        <input
          type="text"
          placeholder="Username atau Email"
          className="border p-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
}
