"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Component untuk handle search params
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const state = searchParams.get("state");
        const redirectPath = searchParams.get("redirect") || "/admin/dashboard";

        console.log('Auth callback received:', { code: !!code, error, state, redirectPath });

        // Handle OAuth error
        if (error) {
          console.error('OAuth error:', error);
          router.replace(`/login?error=${encodeURIComponent(error)}`);
          return;
        }

        // If no code, redirect to login
        if (!code) {
          console.error('No authorization code received');
          router.replace('/login?error=No authorization code received');
          return;
        }

        // Exchange authorization code for tokens
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        console.log('Exchanging code for tokens...');
        
        const response = await fetch(`${backendUrl}/auth/exchange-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ code }),
        });

        const result = await response.json();
        
        console.log('Token exchange result:', { 
          success: result.success, 
          hasUser: !!result.user,
          status: response.status 
        });

        if (!response.ok || !result.success) {
          console.error('Token exchange failed:', result);
          router.replace(`/login?error=${encodeURIComponent(result.message || 'Authentication failed')}`);
          return;
        }

        // Verify token is stored (should be in HTTP-only cookie now)
        // Also check if we need to store anything in localStorage
        if (result.tokens?.access_token) {
          // Optionally store token in localStorage for client-side access
          localStorage.setItem('access_token', result.tokens.access_token);
          console.log('Token stored in localStorage');
        }

        console.log('Authentication successful, redirecting to:', redirectPath);
        
        // Redirect to intended page
        router.replace(redirectPath);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace(`/login?error=${encodeURIComponent('Authentication failed')}`);
      }
    };

    handleCallback();
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
