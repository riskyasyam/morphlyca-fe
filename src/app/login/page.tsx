"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, debugLogin, testBackendConnection } from "@/lib/auth";
import { ArrowLeft, Bug, Wifi } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Component untuk handle search params
function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePrimeLogin = () => {
    // Menggunakan environment variable untuk consistency
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const redirectPath = searchParams.get('redirect') || '/admin/dashboard';
    const params = new URLSearchParams({
      redirect_uri: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
    });
    window.location.href = `${baseUrl}/auth/prime/login?${params.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugInfo("");
    
    // Client-side validation
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔑 Starting login process via PrimeAuth direct endpoint...');
      console.log('📝 Username:', username);
      const result = await login({ username, password });
      
      if (result.success) {
        console.log('✅ Login successful');
        // Redirect to the intended page or admin dashboard
        const redirectPath = searchParams.get('redirect') || '/admin/dashboard';
        router.push(redirectPath);
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('💥 Login exception:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDebugTest = async () => {
    if (!username || !password) {
      setError("Please enter username and password for debug test");
      return;
    }
    
    setLoading(true);
    setError("");
    setDebugInfo("");
    
    try {
      console.log('🔍 Running debug test...');
      
      // Test backend connection first
      const connectionOk = await testBackendConnection();
      if (!connectionOk) {
        setError("Cannot connect to backend server");
        setLoading(false);
        return;
      }
      
      // Run debug login
      const debugResult = await debugLogin({ username, password });
      setDebugInfo(JSON.stringify(debugResult, null, 2));
      console.log('🔍 Debug completed');
      
    } catch (err: any) {
      console.error('🔍 Debug test failed:', err);
      setError(`Debug test failed: ${err.response?.data?.message || err.message}`);
      setDebugInfo(JSON.stringify(err.response?.data || err.message, null, 2));
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
        {/* Back to Home Button */}
        <div className="mb-4 flex justify-center">
          <Image src="/logo/logo.svg" alt="Morpylica" width={150} height={60} />
        </div>
        <div className="mb-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Utama
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-black-900/50 backdrop-blur-sm border border-slate-900 p-8 rounded-xl shadow-2xl w-full relative">
          <div className="text-center mb-6">
            
            <h2 className="text-2xl font-bold text-white mb-2">Login Page</h2>
            <p className="text-slate-400">Login dengan username/email dan password via PrimeAuth</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username atau Email"
              className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
              value={username}
              onChange={e => setUsername(e.target.value)}
              minLength={3}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && <div className="text-red-400 text-sm bg-red-950/20 border border-red-900/50 rounded-lg p-3">{error}</div>}
            
            {/* Debug Info */}
            {debugInfo && (
              <div className="text-yellow-400 text-xs bg-yellow-950/20 border border-yellow-900/50 rounded-lg p-3">
                <details>
                  <summary className="cursor-pointer font-medium">Debug Information</summary>
                  <pre className="mt-2 overflow-auto max-h-40 text-xs">{debugInfo}</pre>
                </details>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>
            
            {/* Debug Controls */}
            {debugMode && (
              <div className="space-y-2 border-t border-slate-700 pt-4">
                <div className="text-xs text-slate-400 text-center">Development Tools</div>
                <button
                  type="button"
                  onClick={handleDebugTest}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <Bug className="w-4 h-4" />
                  Run Debug Test
                </button>
                
                {/* PrimeAuth Configuration Info */}
                <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-3 text-xs">
                  <div className="text-blue-400 font-medium mb-2">PrimeAuth Config:</div>
                  <div className="space-y-1 text-slate-300">
                    <div>Realm: {process.env.NEXT_PUBLIC_PRIMEAUTH_REALM_ID?.slice(0, 8)}...</div>
                    <div>Client: {process.env.NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID}</div>
                    <div>API URL: {process.env.NEXT_PUBLIC_API_URL}</div>
                  </div>
                  <div className="mt-2 text-yellow-300 text-xs">
                    ✅ Backend now uses PrimeAuth direct login endpoint
                    <br />
                    🔗 Endpoint: /api/v1/auth/login (working in debug mode)
                    <br />
                    💡 Production endpoint needs response structure fix
                  </div>
                </div>
              </div>
            )}
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

// Loading component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <span className="text-lg">Loading...</span>
    </div>
  );
}

// Main component dengan Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}