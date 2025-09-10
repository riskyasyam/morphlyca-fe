
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Welcome to Swaplify</h1>
      <div className="flex flex-col gap-4 w-80">
        <button
          onClick={handlePrimeLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded shadow"
        >
          Login dengan PrimeAuth
        </button>
        <button
          onClick={handleCustomLogin}
          className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded shadow"
        >
          Login Manual
        </button>
      </div>
    </div>
  );
}
