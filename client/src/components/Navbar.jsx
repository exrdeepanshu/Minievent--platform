import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  CalendarDays, Plus, User, LogOut, Sun, Moon,
  Menu, X, LayoutDashboard, Zap
} from 'lucide-react';

const s = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    height: 'var(--nav-h)',
    background: 'rgba(8,8,18,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
    transition: 'background var(--t250)',
  },
  navLight: {
    background: 'rgba(245,244,255,0.9)',
  },
  inner: {
    maxWidth: 'var(--max-w)', margin: '0 auto',
    padding: '0 20px',
    height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
    color: 'var(--text)', textDecoration: 'none',
    letterSpacing: '-0.03em',
  },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  navLinks: {
    display: 'flex', alignItems: 'center', gap: 4,
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, color: 'var(--text-2)',
    transition: 'color var(--t150), background var(--t150)',
    cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit',
    textDecoration: 'none',
  },
  navLinkActive: {
    color: 'var(--text)',
    background: 'var(--surface-2)',
  },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
    border: '2px solid var(--primary)',
  },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 12px 4px 4px',
    borderRadius: 50, background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    cursor: 'pointer', transition: 'all var(--t150)',
    fontFamily: 'inherit', color: 'var(--text)', fontSize: 14, fontWeight: 500,
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    minWidth: 200, padding: 8,
    boxShadow: 'var(--shadow-lg)',
    zIndex: 100,
    animation: 'scaleIn 0.15s var(--ease)',
    transformOrigin: 'top right',
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8,
    fontSize: 14, color: 'var(--text-2)',
    cursor: 'pointer', transition: 'all var(--t150)',
    fontFamily: 'inherit', background: 'none', border: 'none', width: '100%',
    textDecoration: 'none',
  },
  mobileMenu: {
    position: 'fixed', inset: 0, top: 'var(--nav-h)', zIndex: 999,
    background: 'var(--bg-2)', padding: 24,
    display: 'flex', flexDirection: 'column', gap: 8,
    borderTop: '1px solid var(--border)',
    animation: 'fadeIn 0.2s var(--ease)',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderRadius: 12,
    fontSize: 16, fontWeight: 500, color: 'var(--text-2)',
    textDecoration: 'none', background: 'none', border: 'none',
    fontFamily: 'inherit', cursor: 'pointer', width: '100%',
  },
};

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggle, isDark } = useTheme();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [open, setOpen]         = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const activeStyle = (path) => isActive(path) ? { ...s.navLink, ...s.navLinkActive } : s.navLink;

  return (
    <>
      <nav style={{ ...s.nav, ...(!isDark ? s.navLight : {}) }}>
        <div style={s.inner}>
          {/* Logo */}
          <Link to="/" style={s.logo}>
            <div style={s.logoIcon}><Zap size={18} color="#fff" /></div>
            <span>Event<span style={{ color: 'var(--primary-light)' }}>Hub</span></span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ ...s.navLinks, '@media(max-width:768px)': { display: 'none' } }} className="desktop-nav">
            <Link to="/events" style={activeStyle('/events')}>
              <CalendarDays size={15} /> Browse Events
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/events/create" style={activeStyle('/events/create')}>
                  <Plus size={15} /> Create
                </Link>
                <Link to="/profile" style={activeStyle('/profile')}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div style={s.right}>
            {/* Theme toggle */}
            <button
              onClick={toggle}
              style={{ ...s.navLink, padding: '8px', borderRadius: '50%' }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={dropRef}>
                <button style={s.avatarBtn} onClick={() => setOpen((p) => !p)}>
                  <img src={user?.avatarUrl} alt={user?.name} style={s.avatar} />
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {open && (
                  <div style={s.dropdown}>
                    <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user?.email}</p>
                    </div>
                    <Link to="/profile" style={s.dropItem}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <User size={15} /> My Dashboard
                    </Link>
                    <Link to="/events/create" style={s.dropItem}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Plus size={15} /> Create Event
                    </Link>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <button onClick={handleLogout} style={{ ...s.dropItem, color: 'var(--danger)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login"
                  style={{ ...s.navLink, display: window.innerWidth < 480 ? 'none' : 'flex' }}
                >Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="btn btn-ghost btn-sm mobile-only"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Menu"
              style={{ padding: '8px', borderRadius: '50%' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          <Link to="/events" style={s.mobileLink}><CalendarDays size={18} /> Browse Events</Link>
          {isAuthenticated && (
            <>
              <Link to="/events/create" style={s.mobileLink}><Plus size={18} /> Create Event</Link>
              <Link to="/profile"       style={s.mobileLink}><LayoutDashboard size={18} /> My Dashboard</Link>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login"    style={s.mobileLink}>Log In</Link>
              <Link to="/register" style={{ ...s.mobileLink, color: 'var(--primary-light)', fontWeight: 600 }}>Sign Up</Link>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} style={{ ...s.mobileLink, color: 'var(--danger)' }}>
              <LogOut size={18} /> Log Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
      `}</style>
    </>
  );
}
