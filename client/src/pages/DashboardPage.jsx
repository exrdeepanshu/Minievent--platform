import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import SearchFilter from '../components/SearchFilter';

export default function DashboardPage() {
  const [events,     setEvents]     = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters,    setFilters]    = useState({
    search: '', category: 'All', date: '', sort: 'date', page: 1,
  });

  const fetchEvents = useCallback(async (f, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const params = {
        search:   f.search   || undefined,
        category: f.category !== 'All' ? f.category : undefined,
        date:     f.date     || undefined,
        sort:     f.sort,
        page:     f.page,
        limit:    12,
      };
      const { data } = await api.get('/events', { params });
      setEvents((prev) => append ? [...prev, ...data.events] : data.events);
      setPagination(data.pagination);
    } catch {
      /* errors silently ignored – empty state handles it */
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Re-fetch when filters change (reset to page 1)
  useEffect(() => {
    fetchEvents({ ...filters, page: 1 });
  }, [filters.search, filters.category, filters.date, filters.sort]); // eslint-disable-line

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const loadMore = () => {
    const next = { ...filters, page: filters.page + 1 };
    setFilters(next);
    fetchEvents(next, true);
  };

  const handleRsvpChange = (eventId) => (updated) => {
    setEvents((prev) =>
      prev.map((e) => e._id === eventId ? { ...e, ...updated } : e)
    );
  };

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 36,
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
              🎪 Upcoming Events
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
              {pagination.total != null
                ? `${pagination.total} event${pagination.total !== 1 ? 's' : ''} found`
                : 'Discover what\'s happening near you'}
            </p>
          </div>
          <Link to="/events/create" className="btn btn-primary">
            <Plus size={16} /> Create Event
          </Link>
        </div>

        {/* Search & Filters */}
        <SearchFilter filters={filters} onChange={handleFilterChange} />

        {/* Events Grid */}
        {loading ? (
          <div className="loader-page">
            <div className="spinner" />
            <p>Loading events…</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or search term, or be the first to create one!</p>
            <Link to="/events/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              <Plus size={16} /> Create Event
            </Link>
          </div>
        ) : (
          <>
            <div className="events-grid stagger">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onRsvpChange={handleRsvpChange(event._id)}
                />
              ))}
            </div>

            {/* Load more */}
            {pagination.hasMore && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn btn-outline btn-lg"
                >
                  {loadingMore
                    ? <><div className="spinner spinner-sm" /> Loading…</>
                    : `Load More (${pagination.total - events.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
