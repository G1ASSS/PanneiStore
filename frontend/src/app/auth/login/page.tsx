'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Gem, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

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
        setError(t('Invalid email or password. Please try again.', 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။'));
        return;
      }
      await getSession();
      router.refresh();
      router.push(callbackUrl);
    } catch {
      setError(t('Something went wrong. Please try again.', 'တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။'));
    } finally {
      setLoading(false);
    }
  };

  const isAdminLogin = callbackUrl.startsWith('/admin');

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
            <h2 className="auth2-brand-headline">{t("Myanmar's #1 MLBB Marketplace", "မြန်မာနိုင်ငံ၏ နံပါတ် ၁ MLBB စျေးကွက်")}</h2>
            <p className="auth2-brand-sub">{t("Buy, sell and top up Mobile Legends diamonds safely with our trusted escrow system.", "ကျွန်ုပ်တို့၏ ယုံကြည်စိတ်ချရသော ကြားခံဝန်ဆောင်မှုဖြင့် Mobile Legends စိန်များကို လုံခြုံစွာ ဝယ်ယူ၊ ရောင်းချ၊ ဖြည့်သွင်းပါ။")}</p>
          </div>

          <div className="auth2-features">
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <p className="auth2-feature-title">{t("Secure Escrow", "လုံခြုံသော ကြားခံစနစ်")}</p>
                <p className="auth2-feature-desc">{t("Every trade is protected by our verified escrow system", "အရောင်းအဝယ်တိုင်းကို စစ်ဆေးအတည်ပြုထားသော ကြားခံစနစ်ဖြင့် ကာကွယ်ထားပါသည်")}</p>
              </div>
            </div>
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><Zap size={18} /></div>
              <div>
                <p className="auth2-feature-title">{t("Instant Top-Up", "ချက်ချင်း စိန်ဖြည့်မည်")}</p>
                <p className="auth2-feature-desc">{t("Diamonds delivered in minutes, 24/7", "စိန်များကို မိနစ်ပိုင်းအတွင်း အချိန်မရွေး ပေးပို့ပါသည်")}</p>
              </div>
            </div>
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><Sparkles size={18} /></div>
              <div>
                <p className="auth2-feature-title">{t("Verified Accounts", "စစ်ဆေးပြီးသော အကောင့်များ")}</p>
                <p className="auth2-feature-desc">{t("All accounts manually verified before listing", "အကောင့်အားလုံးကို မတင်မီ လူကိုယ်တိုင် စစ်ဆေးအတည်ပြုထားပါသည်")}</p>
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
                <Lock size={22} strokeWidth={1.8} className="text-brand-pink" />
              </div>
              <h1 className="auth2-card-title">{t("Welcome back", "ပြန်လည်ကြိုဆိုပါသည်")}</h1>
              <p className="auth2-card-sub">
                {isAdminLogin ? t('Sign in with your admin account', 'Admin အကောင့်ဖြင့် ဝင်ရောက်ပါ') : t('Sign in to your PanneiStore account', 'PanneiStore အကောင့်သို့ ဝင်ရောက်ပါ')}
              </p>
            </div>

            {isAdminLogin && (
              <div className="auth2-notice">
                <ShieldCheck size={15} />
                {t('Admin login:', 'Admin အကောင့်:')} <strong>admin@panneistore.com</strong>
              </div>
            )}

            {/* Google Button */}
            <button
              className="auth2-google-btn"
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("Continue with Google", "Google ဖြင့် ဆက်လက်လုပ်ဆောင်မည်")}
            </button>

            <div className="auth2-divider"><span>{t("or sign in with email", "သို့မဟုတ် အီးမေးလ်ဖြင့် ဝင်ရောက်မည်")}</span></div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth2-form">
              {error && (
                <div className="auth2-error">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <div className="auth2-field">
                <label htmlFor="email" className="auth2-label">
                  <Mail size={14} /> {t("Email Address", "အီးမေးလ် လိပ်စာ")}
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth2-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth2-field">
                <label htmlFor="password" className="auth2-label">
                  <Lock size={14} /> {t("Password", "စကားဝှက်")}
                </label>
                <div className="auth2-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth2-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
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

              <div className="auth2-forgot">
                <Link href="/auth/forgot-password">{t("Forgot password?", "စကားဝှက် မေ့နေပါသလား?")}</Link>
              </div>

              <button type="submit" className="auth2-submit-btn" disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {t("Signing in…", "ဝင်ရောက်နေပါသည်...")}</>
                ) : (
                  t('Sign In', 'အကောင့်ဝင်မည်')
                )}
              </button>
            </form>

            <p className="auth2-switch">
              {t("Don't have an account?", "အကောင့် မရှိသေးဘူးလား?")}{' '}
              <Link href="/auth/register">{t("Create account", "အကောင့်သစ်ဖွင့်မည်")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth2-root"><div className="auth2-loading"><Loader2 size={28} className="animate-spin text-brand-pink" /></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
