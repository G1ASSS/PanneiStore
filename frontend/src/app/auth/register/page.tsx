'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
                <path d="M20 4L36 13V27L20 36L4 27V13L20 4Z" fill="url(#gem-grad2)" />
                <defs>
                  <linearGradient id="gem-grad2" x1="4" y1="4" x2="36" y2="36">
                    <stop stopColor="#EC4899" />
                    <stop offset="1" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join Myanmar&apos;s #1 MLBB marketplace</p>
          </div>

          {/* Progress bar */}
          <div className="auth-progress">
            <div className={`auth-progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`auth-progress-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`auth-progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">Email Address</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    className="form-input"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone (Optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="+95 9 xxx xxx xxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : step === 1 ? (
                'Continue →'
              ) : (
                'Create Account'
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                className="btn-ghost btn-full"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            )}
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
