import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STRENGTH = [
  { label: 'Weak',   color: 'var(--danger)' },
  { label: 'Fair',   color: 'var(--warning)' },
  { label: 'Good',   color: 'var(--info)' },
  { label: 'Strong', color: 'var(--success)' },
];

function getPwStrength(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const strength = getPwStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)  e.name     = 'Name must be at least 2 characters';
    if (!form.email)                                 e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email    = 'Enter a valid email';
    if (form.password.length < 6)                    e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)              e.confirm  = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to EventHub 🎉');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { met: form.password.length >= 6, text: 'At least 6 characters' },
    { met: /[A-Z]/.test(form.password), text: 'Uppercase letter' },
    { met: /[0-9]/.test(form.password), text: 'Number' },
  ];

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 60px' }}>
      <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 460, padding: 'clamp(28px, 5vw, 48px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Zap size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Join thousands of event creators & goers</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input className={`form-input${errors.name ? ' error' : ''}`}
                placeholder="Jane Doe" autoComplete="name"
                value={form.name} onChange={(e) => set('name', e.target.value)}
                style={{ paddingLeft: 42 }} />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input className={`form-input${errors.email ? ' error' : ''}`}
                type="email" placeholder="you@example.com" autoComplete="email"
                value={form.email} onChange={(e) => set('email', e.target.value)}
                style={{ paddingLeft: 42 }} />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input className={`form-input${errors.password ? ' error' : ''}`}
                type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password"
                value={form.password} onChange={(e) => set('password', e.target.value)}
                style={{ paddingLeft: 42, paddingRight: 46 }} />
              <button type="button" onClick={() => setShowPw((p) => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 2 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}

            {/* Strength meter */}
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {[0,1,2,3].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? STRENGTH[strength].color : 'var(--surface-3)', transition: 'all 0.2s' }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: STRENGTH[strength].color }}>{STRENGTH[strength].label} password</p>
              </div>
            )}

            {/* Requirements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              {requirements.map((r) => (
                <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: r.met ? 'var(--success)' : 'var(--text-3)' }}>
                  <Check size={11} style={{ opacity: r.met ? 1 : 0.3 }} /> {r.text}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className={`form-input${errors.confirm ? ' error' : ''}`}
              type="password" placeholder="Repeat your password" autoComplete="new-password"
              value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
            {errors.confirm && <p className="form-error">{errors.confirm}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '13px' }}>
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 0.75s linear infinite' }} /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>
      </div>
    </main>
  );
}
