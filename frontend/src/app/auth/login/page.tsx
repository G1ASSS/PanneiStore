'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });
      if (res?.error) {
        setError('Invalid email or password. Please try again.');
        return;
      }
      await getSession();
      router.refresh();
      router.push(callbackUrl);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminLogin = callbackUrl.startsWith('/admin');

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 13V27L20 36L4 27V13L20 4Z" fill="url(#gem-grad)" />
                <defs>
                  <linearGradient id="gem-grad" x1="4" y1="4" x2="36" y2="36">
                    <stop stopColor="#EC4899" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              {isAdminLogin
                ? 'Sign in with your admin account to continue'
                : 'Sign in to your PanneiStore account'}
            </p>
          </div>

          {isAdminLogin && (
            <div className="auth-error" style={{ marginBottom: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa' }}>
              Use your admin account: <strong>admin@panneistore.com</strong>
            </div>
          )}

          <button
            className="btn-google"
            type="button"
            onClick={() => signIn('google', { callbackUrl })}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="auth-forgot">
              <Link href="/auth/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="auth-loading">Loading…</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
