"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Component untuk handle search params
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Jika backend mengembalikan token di query, bisa diambil di sini
    // Contoh: /auth/callback?access_token=...&refresh_token=...
    // Jika token di body, perlu backend mengirim via query atau cookie agar bisa diambil frontend

    // TODO: Simpan token ke localStorage/cookie jika perlu
    // const accessToken = searchParams.get("access_token");
    // if (accessToken) localStorage.setItem("token", accessToken);

    // Redirect ke dashboard
    router.replace("/admin/dashboard");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg">Mengarahkan ke dashboard...</span>
    </div>
  );
}

// Loading component
function AuthCallbackLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg">Loading...</span>
    </div>
  );
}

// Main component dengan Suspense
export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
