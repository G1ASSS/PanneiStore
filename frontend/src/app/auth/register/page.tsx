'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, AlertCircle, Gem, Sparkles, ShieldCheck, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
            <h2 className="auth2-brand-headline">Join Myanmar&apos;s #1 MLBB Community</h2>
            <p className="auth2-brand-sub">Create your free account and start buying, selling, or topping up in minutes.</p>
          </div>

          <div className="auth2-features">
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <p className="auth2-feature-title">Safe & Secure</p>
                <p className="auth2-feature-desc">Every trade protected by our verified escrow</p>
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
                <p className="auth2-feature-title">Free to Join</p>
                <p className="auth2-feature-desc">No fees to create or maintain your account</p>
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
                <User size={22} strokeWidth={1.8} className="text-brand-pink" />
              </div>
              <h1 className="auth2-card-title">Create Account</h1>
              <p className="auth2-card-sub">Get started with your free PanneiStore account</p>
            </div>

            {/* Step Indicator */}
            <div className="auth2-steps">
              <div className={`auth2-step ${step >= 1 ? 'active' : ''}`}>
                <div className="auth2-step-dot">
                  {step > 1 ? <span>✓</span> : <span>1</span>}
                </div>
                <span className="auth2-step-label">Your Info</span>
              </div>
              <div className={`auth2-step-line ${step >= 2 ? 'active' : ''}`} />
              <div className={`auth2-step ${step >= 2 ? 'active' : ''}`}>
                <div className="auth2-step-dot"><span>2</span></div>
                <span className="auth2-step-label">Security</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth2-form">
              {error && (
                <div className="auth2-error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="auth2-field">
                    <label htmlFor="name" className="auth2-label">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="auth2-input"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="auth2-field">
                    <label htmlFor="reg-email" className="auth2-label">
                      <Mail size={14} /> Email Address
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="auth2-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="auth2-field">
                    <label htmlFor="reg-password" className="auth2-label">
                      <Lock size={14} /> Password
                    </label>
                    <div className="auth2-input-wrap">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        className="auth2-input"
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="auth2-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="auth2-field">
                    <label htmlFor="phone" className="auth2-label">
                      <Phone size={14} /> Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="auth2-input"
                      placeholder="+95 9 xxx xxx xxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="auth2-submit-btn" 
                disabled={loading || (step === 2 && (!form.password || !form.phone))}
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating Account…</>
                ) : step === 1 ? (
                  <>Continue <ArrowRight size={16} /></>
                ) : (
                  'Create Account'
                )}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  className="auth2-back-btn"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
            </form>

            <p className="auth2-switch">
              Already have an account?{' '}
              <Link href="/auth/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
