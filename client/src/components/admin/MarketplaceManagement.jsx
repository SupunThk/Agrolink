import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, MoreHorizontal, ShoppingBag, Filter } from 'lucide-react';
import { MOCK_LISTINGS } from './data/mockData';

const card = {
  background: 'var(--bg-card)',
  borderRadius: 20,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-zen)',
  overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 600,
};

const th = {
  padding: '10px 20px',
  fontFamily: 'var(--font-display)',
  fontSize: 10, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'var(--slate-400)',
  background: 'var(--bg-surface)',
  borderBottom: '1px solid var(--glass-border)',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '14px 20px',
  fontFamily: 'var(--font-body)',
  fontSize: 13, color: 'var(--slate-700)',
  verticalAlign: 'middle',
};

const statusPill = (status) => {
  const map = {
    Active: { bg: 'var(--status-green-bg)', color: 'var(--status-green-txt)', border: 'var(--status-green-border)' },
    Rejected: { bg: 'var(--status-red-bg)', color: 'var(--status-red-txt)', border: 'var(--status-red-border)' },
    Pending: { bg: 'var(--status-yellow-bg)', color: 'var(--status-yellow-txt)', border: 'var(--status-yellow-border)' },
  };
  const s = map[status] || map.Pending;
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
  };
};

const MarketplaceManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredListings = activeFilter === 'All'
    ? MOCK_LISTINGS
    : MOCK_LISTINGS.filter(l => l.status === activeFilter);

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--slate-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={18} style={{ color: 'var(--emerald-600)' }} />
              Marketplace Listings
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>
              Manage crops and products sold by farmers
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search products…"
                style={{
                  paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                  borderRadius: 10, fontSize: 13, color: 'var(--slate-900)',
                  fontFamily: 'var(--font-body)', outline: 'none', width: 200,
                }}
              />
            </div>
            <button style={{
              padding: '7px 10px', borderRadius: 10,
              border: '1px solid var(--glass-border)', background: 'var(--bg-card)',
              color: 'var(--slate-500)', cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--emerald-600)'; e.currentTarget.style.borderColor = 'var(--emerald-600)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-500)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['All', 'Active', 'Pending', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              style={{
                padding: '5px 14px', borderRadius: 9, border: '1px solid',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                background: activeFilter === s ? 'var(--emerald-600)' : 'var(--bg-card)',
                color: activeFilter === s ? '#fff' : 'var(--slate-500)',
                borderColor: activeFilter === s ? 'var(--emerald-600)' : 'var(--glass-border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Product</th>
              <th style={th}>Price &amp; Stock</th>
              <th style={th}>Seller</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map(listing => (
              <tr
                key={listing.id}
                style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--mint-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={listing.image} alt={listing.title}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--glass-border)', flexShrink: 0 }}
                    />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--slate-900)', display: 'block', fontSize: 13 }}>{listing.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>{listing.category}</span>
                    </div>
                  </div>
                </td>
                <td style={td}>
                  <span style={{ fontWeight: 700, color: 'var(--slate-900)', display: 'block' }}>{listing.price}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>Stock: {listing.stock}</span>
                </td>
                <td style={td}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-600)', display: 'block' }}>{listing.seller}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>{listing.date}</span>
                </td>
                <td style={td}>
                  <span style={statusPill(listing.status)}>{listing.status}</span>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                    {listing.status === 'Pending' && (
                      <>
                        <button title="Approve" style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--status-green-bg)', color: 'var(--status-green-txt)', cursor: 'pointer' }}>
                          <CheckCircle size={15} />
                        </button>
                        <button title="Reject" style={{ padding: 6, borderRadius: 8, border: 'none', background: 'var(--status-red-bg)', color: 'var(--status-red-txt)', cursor: 'pointer' }}>
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    <button title="View" style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--slate-400)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--emerald-600)'; e.currentTarget.style.background = 'var(--mint-100)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-400)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Eye size={15} />
                    </button>
                    <button title="More" style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--slate-400)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--slate-600)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--slate-400)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketplaceManagement;