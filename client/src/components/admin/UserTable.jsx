import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_USERS } from './data/mockData';

const STATUSES = ['All', 'Active', 'Inactive'];
const PAGE_SIZE = 6;

// ── Shared card/table styles via CSS vars ───────────────────────────────────
const card = {
  background: 'var(--bg-card)',
  borderRadius: 20,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-zen)',
  overflow: 'hidden',
};

const th = {
  padding: '10px 20px',
  fontFamily: 'var(--font-display)',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--slate-400)',
  background: 'var(--bg-surface)',
  borderBottom: '1px solid var(--glass-border)',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '14px 20px',
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  color: 'var(--slate-700)',
  verticalAlign: 'middle',
};

const statusBadge = (status) => {
  const map = {
    Active: { bg: 'var(--status-green-bg)', color: 'var(--status-green-txt)', border: 'var(--status-green-border)' },
    Inactive: { bg: 'var(--status-gray-bg)', color: 'var(--status-gray-txt)', border: 'var(--status-gray-border)' },
  };
  const s = map[status] || map.Inactive;
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
  };
};

const UserTable = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = activeFilter === 'All'
    ? MOCK_USERS
    : MOCK_USERS.filter(u => u.status === activeFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (f) => { setActiveFilter(f); setPage(1); };

  return (
    <div style={card}>
      {/* Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
        background: 'var(--bg-surface)',
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
            Recent Users
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>
            {filtered.length} users found
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--slate-200)', padding: 4, borderRadius: 12,
        }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleFilter(s)}
              style={{
                padding: '5px 14px', borderRadius: 9, border: 'none',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: activeFilter === s ? 'var(--emerald-600)' : 'transparent',
                color: activeFilter === s ? '#fff' : 'var(--slate-500)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Role</th>
              <th style={th}>Location</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr
                key={user.id}
                style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--mint-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--slate-400)' }}>
                  #{String(user.id).padStart(4, '0')}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-900))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--slate-900)', display: 'block', fontSize: 13 }}>
                        {user.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>
                        {user.email || `user${user.id}@agrolink.com`}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={td}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 8,
                    background: 'var(--status-gray-bg)', color: 'var(--status-gray-txt)',
                    border: '1px solid var(--status-gray-border)',
                    fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)',
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ ...td, color: 'var(--slate-500)' }}>{user.location}</td>
                <td style={td}>
                  <span style={statusBadge(user.status)}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: user.status === 'Active' ? 'var(--status-green-txt)' : 'var(--status-gray-txt)',
                    }} />
                    {user.status}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button style={{
                    padding: 6, borderRadius: 8, border: 'none',
                    background: 'transparent', color: 'var(--slate-400)', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--emerald-600)'; e.currentTarget.style.background = 'var(--mint-100)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-400)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Settings size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        padding: '14px 24px', borderTop: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        background: 'var(--bg-surface)',
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-400)' }}>
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--slate-400)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.35 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
                background: p === page ? 'var(--emerald-600)' : 'transparent',
                color: p === page ? '#fff' : 'var(--slate-400)',
              }}
            >{p}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--slate-400)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.35 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;