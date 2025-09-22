"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Component untuk handle search params
function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Jika ingin ambil user_id/email dari query, bisa di sini
    // const userId = searchParams.get("user_id");
    // const email = searchParams.get("email");
    // Simpan ke localStorage/cookie jika perlu

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
function AuthSuccessLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg">Loading...</span>
    </div>
  );
}

// Main component dengan Suspense
export default function AuthSuccess() {
  return (
    <Suspense fallback={<AuthSuccessLoading />}>
      <AuthSuccessContent />
    </Suspense>
  );
}
