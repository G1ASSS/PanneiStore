'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, Gem, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('Please enter your email address', 'ကျေးဇူးပြု၍ သင့်အီးမေးလ်လိပ်စာကို ထည့်ပါ'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('Something went wrong. Please try again.', 'တစ်ခုခု မှားယွင်းနေပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။'));
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
                <Mail size={28} strokeWidth={2} />
              </div>
              <h1 className="auth2-card-title">{t("Forgot Password", "စကားဝှက် မေ့နေသည်")}</h1>
              <p className="auth2-card-sub">{t("Enter your email to receive a reset link", "စကားဝှက် ပြန်လည်သတ်မှတ်ရန် လင့်ခ် ရယူရန် သင့်အီးမေးလ်ကို ထည့်ပါ")}</p>
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("Check your email", "သင့်အီးမေးလ်ကို စစ်ဆေးပါ")}</h3>
                <p className="text-gray-600 dark:text-brand-muted text-sm leading-relaxed max-w-xs mx-auto mb-3">
                  {t("We have sent a password reset link to", "စကားဝှက် ပြန်လည်သတ်မှတ်ရန် လင့်ခ်ကို အောက်ပါသို့ ပေးပို့ထားပါသည်")} <strong className="text-gray-900 dark:text-white">{email}</strong>.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-brand-muted/70 text-xs mb-8 font-medium">
                  <AlertCircle size={13} className="opacity-70" />
                  <span>{t("Please check your Spam folder if you don't see it.", "အီးမေးလ်မတွေ့ပါက သင့်၏ Spam folder ကို စစ်ဆေးပါ။")}</span>
                </div>
                <Link href="/auth/login" className="auth2-back-btn">
                  {t("Back to Login", "အကောင့်ဝင်ရန် သို့ ပြန်သွားမည်")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth2-form">
                <div className="auth2-field">
                  <label className="auth2-label">{t("Email Address", "အီးမေးလ် လိပ်စာ")}</label>
                  <div className="auth2-input-wrap">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted/50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth2-input !pl-12"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !email}
                  className="auth2-submit-btn mt-4"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : t('Send Reset Link', 'လင့်ခ် ပေးပို့မည်')}
                </button>

                <div className="auth2-switch mt-6">
                  {t("Remember your password?", "စကားဝှက်ကို မှတ်မိပြီလား?")}{' '}
                  <Link href="/auth/login">{t("Back to Login", "အကောင့်ဝင်ရန် သို့ ပြန်သွားမည်")}</Link>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
