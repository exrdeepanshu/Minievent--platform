import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-2)',
      padding: '48px 20px 32px',
    }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 40, marginBottom: 40,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>
                Event<span style={{ color: 'var(--primary-light)' }}>Hub</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 200 }}>
              Discover, create, and RSVP to amazing events happening near you.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase',
                         letterSpacing: '0.06em', marginBottom: 16 }}>Platform</h4>
            {[['Browse Events', '/events'], ['Create Event', '/events/create'], ['My Dashboard', '/profile']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', fontSize: 14, color: 'var(--text-3)',
                                               marginBottom: 10, transition: 'color 0.15s',
                                               textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                {label}
              </Link>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase',
                         letterSpacing: '0.06em', marginBottom: 16 }}>Account</h4>
            {[['Sign Up', '/register'], ['Log In', '/login']].map(([label, to]) => (
              <Link key={to} to={to} style={{ display: 'block', fontSize: 14, color: 'var(--text-3)',
                                               marginBottom: 10, transition: 'color 0.15s', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, paddingTop: 24, borderTop: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            © {year} EventHub. Made with <Heart size={12} style={{ display: 'inline', color: 'var(--accent)' }} /> for the MERN assignment.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="https://github.com" target="_blank" rel="noreferrer"
              style={{ color: 'var(--text-3)', transition: 'color 0.15s', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            ><Github size={18} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"
              style={{ color: 'var(--text-3)', transition: 'color 0.15s', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            ><Twitter size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
