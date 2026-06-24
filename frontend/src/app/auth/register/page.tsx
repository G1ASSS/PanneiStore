'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2, AlertCircle, Gem, Sparkles, ShieldCheck, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

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
            <h2 className="auth2-brand-headline">{t("Join Myanmar's #1 MLBB Community", "မြန်မာနိုင်ငံ၏ နံပါတ် ၁ MLBB အသိုက်အဝန်းသို့ ဝင်ရောက်ပါ")}</h2>
            <p className="auth2-brand-sub">{t("Create your free account and start buying, selling, or topping up in minutes.", "သင်၏ အခမဲ့အကောင့်ကို ဖန်တီးပြီး မိနစ်ပိုင်းအတွင်း ဝယ်ယူ၊ ရောင်းချ၊ သို့မဟုတ် စိန်ဖြည့်လိုက်ပါ။")}</p>
          </div>

          <div className="auth2-features">
            <div className="auth2-feature-item">
              <div className="auth2-feature-icon"><ShieldCheck size={18} /></div>
              <div>
                <p className="auth2-feature-title">{t("Safe & Secure", "လုံခြုံစိတ်ချရမှု")}</p>
                <p className="auth2-feature-desc">{t("Every trade protected by our verified escrow", "အရောင်းအဝယ်တိုင်းကို စစ်ဆေးအတည်ပြုထားသော ကြားခံစနစ်ဖြင့် ကာကွယ်ထားပါသည်")}</p>
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
                <p className="auth2-feature-title">{t("Free to Join", "အခမဲ့ ပါဝင်ပါ")}</p>
                <p className="auth2-feature-desc">{t("No fees to create or maintain your account", "အကောင့်ဖွင့်ရန် သို့မဟုတ် ထိန်းသိမ်းရန် အခကြေးငွေ မရှိပါ")}</p>
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
              <h1 className="auth2-card-title">{t("Create Account", "အကောင့်သစ်ဖွင့်မည်")}</h1>
              <p className="auth2-card-sub">{t("Get started with your free PanneiStore account", "သင်၏ အခမဲ့ PanneiStore အကောင့်ဖြင့် စတင်လိုက်ပါ")}</p>
            </div>

            {/* Step Indicator */}
            <div className="auth2-steps">
              <div className={`auth2-step ${step >= 1 ? 'active' : ''}`}>
                <div className="auth2-step-dot">
                  {step > 1 ? <span>✓</span> : <span>1</span>}
                </div>
                <span className="auth2-step-label">{t("Your Info", "သင့်အချက်အလက်များ")}</span>
              </div>
              <div className={`auth2-step-line ${step >= 2 ? 'active' : ''}`} />
              <div className={`auth2-step ${step >= 2 ? 'active' : ''}`}>
                <div className="auth2-step-dot"><span>2</span></div>
                <span className="auth2-step-label">{t("Security", "လုံခြုံရေး")}</span>
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
                      <User size={14} /> {t("Full Name", "အမည်အပြည့်အစုံ")}
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
                      <Mail size={14} /> {t("Email Address", "အီးမေးလ် လိပ်စာ")}
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
                      <Lock size={14} /> {t("Password", "စကားဝှက်")}
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
                      <Phone size={14} /> {t("Phone Number", "ဖုန်းနံပါတ်")}
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
                  <><Loader2 size={18} className="animate-spin" /> {t("Creating Account…", "အကောင့် ဖန်တီးနေပါသည်...")}</>
                ) : step === 1 ? (
                  <>{t("Continue", "ဆက်လက်လုပ်ဆောင်မည်")} <ArrowRight size={16} /></>
                ) : (
                  t('Create Account', 'အကောင့်သစ်ဖွင့်မည်')
                )}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  className="auth2-back-btn"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> {t("Back", "နောက်သို့")}
                </button>
              )}
            </form>

            <p className="auth2-switch">
              {t("Already have an account?", "အကောင့် ရှိပြီးသားလား?")}{' '}
              <Link href="/auth/login">{t("Sign in", "အကောင့်ဝင်မည်")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
