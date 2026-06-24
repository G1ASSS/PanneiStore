'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Phone, Globe, Lock, Mail,
  CheckCircle2, AlertCircle, Save, Eye, EyeOff,
} from 'lucide-react';

/* ─── Input component ─── */
function FormField({
  label, id, type = 'text', value, onChange, placeholder, icon, disabled = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700, color: 'var(--heading)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted)', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%', padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            borderRadius: 12, border: '1px solid var(--card-border)',
            background: disabled ? 'var(--card-border)' : 'var(--soft-surface)',
            color: disabled ? 'var(--muted)' : 'var(--heading)',
            fontSize: 14, fontWeight: 500,
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = 'rgba(255,46,147,0.4)';
              e.target.style.boxShadow = '0 0 0 3px rgba(255,46,147,0.1)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--card-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

/* ─── Password field with show/hide ─── */
function PasswordField({
  label, id, value, onChange, placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 700, color: 'var(--heading)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--muted)', pointerEvents: 'none',
        }}>
          <Lock size={15} />
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '12px 44px 12px 42px',
            borderRadius: 12, border: '1px solid var(--card-border)',
            background: 'var(--soft-surface)', color: 'var(--heading)',
            fontSize: 14, fontWeight: 500,
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(255,46,147,0.4)';
            e.target.style.boxShadow = '0 0 0 3px rgba(255,46,147,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--card-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', padding: 0, display: 'flex',
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Alert banner ─── */
function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 12,
      background: type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
      color: type === 'success' ? '#10B981' : '#EF4444',
      fontSize: 13, fontWeight: 600,
    }}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

/* ─── Section card ─── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--card-border)',
      borderRadius: 20, overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        padding: '16px 20px 0',
        fontSize: 12, fontWeight: 700, color: 'var(--muted)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        {title}
      </div>
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────── Main Page ──────────────────────────────── */
export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const token = (session as any)?.accessToken;

  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('en');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated' && token) fetchMe();
  }, [status, token]);

  const fetchMe = async () => {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        const u = d.data.user;
        setName(u.name ?? '');
        setPhone(u.phone ?? '');
        setLanguage(u.language ?? 'en');
        setEmail(u.email ?? '');
      }
    } catch { /* ignore */ }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setProfileMsg(null);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, language }),
      });
      const d = await r.json();
      if (d.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ type: 'error', text: d.message || 'Failed to update profile.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setChangingPw(true);
    setPwMsg(null);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await r.json();
      if (d.success) {
        setPwMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPwMsg({ type: 'error', text: d.message || 'Failed to change password.' });
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setChangingPw(false);
    }
  };

  if (status === 'loading') return <div className="page-loading" />;

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 0 16px' }}>

      {/* Back button */}
      <Link href="/profile" style={{ textDecoration: 'none' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 14, fontWeight: 600,
          marginBottom: 20, padding: 0,
          transition: 'color 0.2s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ff2e93')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <ArrowLeft size={18} /> Back to Profile
        </button>
      </Link>

      <h1 style={{
        fontSize: 22, fontWeight: 900, color: 'var(--heading)',
        letterSpacing: '-0.02em', marginBottom: 20,
      }}>
        Edit Profile
      </h1>

      {/* ── Profile Info ── */}
      <Card title="Personal Info">
        <FormField
          label="Email Address"
          id="email"
          value={email}
          onChange={() => { }}
          icon={<Mail size={15} />}
          disabled
          placeholder="Your email"
        />
        <FormField
          label="Display Name"
          id="name"
          value={name}
          onChange={setName}
          icon={<User size={15} />}
          placeholder="Your name"
        />
        <FormField
          label="Phone Number"
          id="phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          icon={<Phone size={15} />}
          placeholder="e.g. 09xxxxxxxxx"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="language" style={{ fontSize: 13, fontWeight: 700, color: 'var(--heading)' }}>
            Language
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--muted)', pointerEvents: 'none',
            }}>
              <Globe size={15} />
            </span>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px 12px 42px',
                borderRadius: 12, border: '1px solid var(--card-border)',
                background: 'var(--soft-surface)', color: 'var(--heading)',
                fontSize: 14, fontWeight: 500,
                outline: 'none', boxSizing: 'border-box', appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="en">English</option>
              <option value="my">မြန်မာဘာသာ</option>
            </select>
          </div>
        </div>

        {profileMsg && <Alert type={profileMsg.type} message={profileMsg.text} />}

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            background: saving ? 'var(--card-border)' : 'linear-gradient(135deg, #ff2e93, #a12cff)',
            color: saving ? 'var(--muted)' : '#fff',
            fontSize: 14, fontWeight: 700,
            boxShadow: saving ? 'none' : '0 4px 20px rgba(255,46,147,0.35)',
            transition: 'all 0.2s',
          }}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </Card>

      {/* ── Change Password ── */}
      <Card title="Change Password">
        <PasswordField
          label="Current Password"
          id="currentPassword"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Enter current password"
        />
        <PasswordField
          label="New Password"
          id="newPassword"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="Confirm New Password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat new password"
        />

        {pwMsg && <Alert type={pwMsg.type} message={pwMsg.text} />}

        <button
          onClick={handleChangePassword}
          disabled={changingPw}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 12, cursor: changingPw ? 'not-allowed' : 'pointer',
            background: changingPw ? 'var(--card-border)' : 'var(--soft-surface)',
            color: changingPw ? 'var(--muted)' : 'var(--heading)',
            fontSize: 14, fontWeight: 700,
            border: '1px solid var(--card-border)',
            transition: 'all 0.2s',
          }}
        >
          <Lock size={16} /> {changingPw ? 'Changing…' : 'Change Password'}
        </button>
      </Card>

    </div>
  );
}
