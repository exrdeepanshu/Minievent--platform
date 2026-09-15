import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  'All', 'Technology', 'Music', 'Sports', 'Art',
  'Food', 'Business', 'Health', 'Education', 'Entertainment', 'Other',
];

const SORTS = [
  { value: 'date',    label: '📅 Soonest' },
  { value: 'popular', label: '🔥 Popular' },
  { value: 'newest',  label: '✨ Newest' },
];

export default function SearchFilter({ filters, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = useCallback((key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  }, [filters, onChange]);

  const clear = () => onChange({ search: '', category: 'All', date: '', sort: 'date', page: 1 });

  const hasActive = filters.search || filters.category !== 'All' || filters.date;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
      {/* Search bar */}
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                   color: 'var(--text-3)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          className="form-input"
          placeholder="Search events by name, location…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          style={{ paddingLeft: 46, paddingRight: filters.search ? 46 : 16, fontSize: 15 }}
        />
        {filters.search && (
          <button onClick={() => set('search', '')}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                     background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)',
                     display: 'flex', padding: 2, borderRadius: 4 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => set('category', cat)}
            style={{
              padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 500,
              border: `1px solid ${filters.category === cat ? 'var(--primary)' : 'var(--border)'}`,
              background: filters.category === cat
                ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                : 'var(--surface)',
              color: filters.category === cat ? '#fff' : 'var(--text-2)',
              cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}
          >
            {cat}
          </button>
        ))}

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced((p) => !p)}
          style={{
            marginLeft: 'auto', padding: '6px 14px', borderRadius: 50,
            fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          <SlidersHorizontal size={14} />
          {showAdvanced ? 'Less' : 'Filters'}
        </button>

        {/* Clear button */}
        {hasActive && (
          <button onClick={clear}
            style={{
              padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
              color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Advanced filters (date + sort) */}
      {showAdvanced && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, padding: 20, background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', animation: 'fadeUp 0.2s ease',
        }}>
          <div className="form-group">
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.date}
              onChange={(e) => set('date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sort}
              onChange={(e) => set('sort', e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
