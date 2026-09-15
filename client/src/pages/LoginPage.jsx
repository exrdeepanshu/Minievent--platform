import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = location.state?.from?.pathname || '/events';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 20px 60px', position: 'relative',
    }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 600, height: 600, borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }} />
      </div>

      <div className="card animate-scaleIn" style={{ width: '100%', maxWidth: 440, padding: 'clamp(28px, 5vw, 48px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Zap size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Log in to your EventHub account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
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
                type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={(e) => set('password', e.target.value)}
                style={{ paddingLeft: 42, paddingRight: 46 }} />
              <button type="button" onClick={() => setShowPw((p) => !p)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                         background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 2 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: 4, padding: '13px' }}>
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 0.75s linear infinite' }} /> Logging in…</> : 'Log In'}
          </button>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
