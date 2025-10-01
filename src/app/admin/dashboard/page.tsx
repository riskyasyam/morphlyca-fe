"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing login...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log('Auth callback received:', { 
        hasCode: !!code, 
        error, 
        errorDescription,
        fullUrl: window.location.href 
      });

      if (error) {
        console.error('OAuth Error:', error, errorDescription);
        setStatus('error');
        setMessage(`Login error: ${errorDescription || error}`);
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`);
        }, 2000);
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => {
          router.push('/login?error=No authorization code');
        }, 2000);
        return;
      }

      try {
        setStatus('exchanging');
        setMessage('Exchanging authorization code for token...');
        
        // Exchange code for token via backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://api.morphlyca.meetaza.com';
        const response = await fetch(`${apiUrl}/auth/exchange-code`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include', // Important for cookies
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Exchange failed:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Exchange result:', { 
          success: result.success, 
          hasUser: !!result.user,
          userId: result.user?.id 
        });

        if (result.success) {
          setStatus('success');
          setMessage('Login successful! Redirecting to dashboard...');
          
          // Store user data if provided
          if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(result.message || 'Login failed');
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(result.message || 'Login failed')}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Token exchange failed:', error);
        setStatus('error');
        setMessage('Token exchange failed');
        setTimeout(() => {
          router.push('/login?error=Token exchange failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background effects - sama seperti dashboard */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="z-10 text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/logo/logo.svg" alt="Morphlyca" width={150} height={60} />
        </div>

        {/* Status Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-8 rounded-xl shadow-2xl">
          <div className="text-center">
            {/* Status Icon */}
            <div className="mb-6">
              {status === 'processing' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
              )}
              {status === 'exchanging' && (
                <div className="animate-pulse">
                  <div className="text-6xl">🔑</div>
                </div>
              )}
              {status === 'success' && (
                <div className="text-6xl text-green-400">✅</div>
              )}
              {status === 'error' && (
                <div className="text-6xl text-red-400">❌</div>
              )}
            </div>

            {/* Status Message */}
            <h2 className="text-2xl font-bold text-white mb-4">
              {status === 'processing' && 'Processing Login'}
              {status === 'exchanging' && 'Authenticating'}
              {status === 'success' && 'Login Successful!'}
              {status === 'error' && 'Login Failed'}
            </h2>

            <p className="text-slate-400 mb-6">{message}</p>

            {/* Progress indicator */}
            {(status === 'processing' || status === 'exchanging') && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full animate-pulse" style={{
                  width: status === 'processing' ? '33%' : '66%'
                }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Debug info untuk development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-slate-500 bg-slate-900/50 p-4 rounded-lg">
            <div>Code: {searchParams.get('code') ? '✅ Received' : '❌ Missing'}</div>
            <div>State: {searchParams.get('state') || 'None'}</div>
            <div>API URL: {process.env.NEXT_PUBLIC_API_URL}</div>
          </div>
        )}
      </div>
    </div>
  );
}