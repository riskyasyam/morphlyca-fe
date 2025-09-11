
"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handlePrimeLogin = () => {
    // Ganti URL callback agar diarahkan ke /admin/dashboard setelah login
    const params = new URLSearchParams({
      redirect_uri: `${window.location.origin}/admin/dashboard`
    });
    window.location.href = `http://localhost:3000/auth/prime/login?${params.toString()}`;
  };

  const handleCustomLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Subtle light effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-slate-900 font-bold text-2xl">S</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Swaplify</h1>
        <p className="text-slate-400 text-lg">Pilih metode login untuk melanjutkan</p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-sm relative z-10">
        <button
          onClick={handlePrimeLogin}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          Login dengan PrimeAuth
        </button>
        <button
          onClick={handleCustomLogin}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-white font-semibold py-4 rounded-lg transition-all duration-200"
        >
          Login Manual
        </button>
      </div>
    </div>
  );
}
