'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, Gem, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword: form.newPassword 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setSuccess(true);
      // Wait a few seconds then redirect to login
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth2-root">
      {/* ── Animated Background ── */}
      <div className="auth2-bg">
        <div className="auth2-orb auth2-orb-1" />
        <div className="auth2-orb auth2-orb-2" />
        <div className="auth2-orb auth2-orb-3" />
        <div className="auth2-grid" />
      </div>

      {/* ── Split Layout ── */}
      <div className="auth2-layout">

        {/* LEFT PANEL — Branding */}
        <div className="auth2-brand">
          <Link href="/" className="auth2-brand-logo">
            <Gem size={32} strokeWidth={1.5} className="text-brand-pink" />
            <span className="auth2-brand-name">Pannei<span className="text-brand-pink">Store</span></span>
          </Link>

          <div className="auth2-brand-hero">
            <h2 className="auth2-brand-headline">Myanmar&apos;s #1 MLBB Marketplace</h2>
            <p className="auth2-brand-sub">Buy, sell and top up Mobile Legends diamonds safely with our trusted escrow system.</p>
          </div>

          <div className="auth2-features">
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <p className="auth2-feature-title">Secure Escrow</p>
                <p className="auth2-feature-desc">Every trade is protected by our verified escrow system</p>
              </div>
            </div>
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><Zap size={18} /></div>
              <div>
                <p className="auth2-feature-title">Instant Top-Up</p>
                <p className="auth2-feature-desc">Diamonds delivered in minutes, 24/7</p>
              </div>
            </div>
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><Sparkles size={18} /></div>
              <div>
                <p className="auth2-feature-title">Verified Accounts</p>
                <p className="auth2-feature-desc">All accounts manually verified before listing</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div className="auth2-panel">
          <div className="auth2-card">

            {/* Card Header */}
            <div className="auth2-card-header">
              <div className="auth2-card-icon">
                <Lock size={28} strokeWidth={2} />
              </div>
              <h1 className="auth2-card-title">Reset Password</h1>
              <p className="auth2-card-sub">Create a new secure password</p>
            </div>

            {error && (
              <div className="auth2-error mb-4">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 text-green-500 shadow-[0_0_24px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Password Reset Successful</h3>
                <p className="text-brand-muted text-sm leading-relaxed max-w-xs mx-auto mb-8">
                  Your password has been successfully updated. Redirecting to login...
                </p>
                <Link href="/auth/login" className="auth2-back-btn">
                  Go to Login Now
                </Link>
              </div>
            ) : !token ? (
               <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-500 shadow-[0_0_24px_rgba(239,68,68,0.2)]">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Invalid Link</h3>
                <p className="text-brand-muted text-sm leading-relaxed max-w-xs mx-auto mb-8">
                  This password reset link is invalid or missing the token. Please request a new one.
                </p>
                <Link href="/auth/forgot-password" className="auth2-back-btn">
                  Request New Link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth2-form">
                <div className="auth2-field">
                  <label className="auth2-label">New Password</label>
                  <div className="auth2-input-wrap">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="auth2-input !pl-12"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="auth2-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth2-field">
                  <label className="auth2-label">Confirm New Password</label>
                  <div className="auth2-input-wrap">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted/50" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="auth2-input !pl-12"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="auth2-eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !form.newPassword || !form.confirmPassword}
                  className="auth2-submit-btn mt-6"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth2-loading"><Loader2 size={40} className="animate-spin text-brand-pink" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
