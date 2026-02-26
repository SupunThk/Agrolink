import React, { useState } from 'react';
import {
  Search, Eye, Flag, XCircle, CheckCircle,
  MoreHorizontal, List, Grid, Send
} from 'lucide-react';
import { MOCK_BLOGS } from './data/mockData';

const card = {
  background: 'var(--bg-card)',
  borderRadius: 20,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-zen)',
  display: 'flex', flexDirection: 'column',
  minHeight: 600, overflow: 'hidden',
};

const statusPill = (status) => {
  const map = {
    Approved: { bg: 'var(--status-green-bg)', color: 'var(--status-green-txt)', border: 'var(--status-green-border)' },
    Rejected: { bg: 'var(--status-red-bg)', color: 'var(--status-red-txt)', border: 'var(--status-red-border)' },
    Pending: { bg: 'var(--status-yellow-bg)', color: 'var(--status-yellow-txt)', border: 'var(--status-yellow-border)' },
  };
  const s = map[status] || map.Pending;
  return {
    padding: '3px 10px', borderRadius: 20, flexShrink: 0,
    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
  };
};

const iconBtn = (variant = 'default') => {
  const map = {
    default: { color: 'var(--slate-400)', hoverColor: 'var(--slate-600)', hoverBg: 'var(--bg-surface)' },
    green: { color: 'var(--emerald-600)', hoverBg: 'var(--status-green-bg)' },
    red: { color: 'var(--status-red-txt)', hoverBg: 'var(--status-red-bg)' },
    orange: { color: '#d97706', hoverBg: 'var(--status-yellow-bg)' },
  };
  return map[variant];
};

const BlogModeration = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list');

  const filteredBlogs = activeFilter === 'All'
    ? MOCK_BLOGS
    : MOCK_BLOGS.filter(b => b.status === activeFilter);

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
              Content Moderation
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>
              Manage community posts and knowledge sharing
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search posts…"
                style={{
                  paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                  background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                  borderRadius: 10, fontSize: 13, color: 'var(--slate-900)',
                  fontFamily: 'var(--font-body)', outline: 'none', width: 220,
                }}
              />
            </div>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'var(--slate-200)', padding: 3, borderRadius: 10, gap: 2 }}>
              {[{ mode: 'list', Icon: List }, { mode: 'grid', Icon: Grid }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '5px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: viewMode === mode ? 'var(--bg-card)' : 'transparent',
                    color: viewMode === mode ? 'var(--emerald-600)' : 'var(--slate-400)',
                    boxShadow: viewMode === mode ? 'var(--shadow-subtle)' : 'none',
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
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

      {/* Content */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 24,
        display: viewMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
        flexDirection: viewMode === 'list' ? 'column' : undefined,
        gap: 16, background: 'var(--bg-snow)',
      }}>
        {filteredBlogs.map(blog => (
          <div
            key={blog.id}
            style={{
              background: 'var(--bg-card)', borderRadius: 16,
              border: '1px solid var(--glass-border)',
              overflow: 'hidden', transition: 'all 0.25s var(--ease-zen)',
              display: 'flex', flexDirection: viewMode === 'list' ? 'row' : 'column',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(6,78,59,0.1)'; e.currentTarget.style.borderColor = 'var(--emerald-600)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            {/* Thumbnail */}
            <div style={{
              flexShrink: 0, overflow: 'hidden', position: 'relative',
              width: viewMode === 'list' ? 200 : '100%',
              height: viewMode === 'list' ? 'auto' : 180,
              minHeight: viewMode === 'list' ? 120 : undefined,
            }}>
              <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{
                position: 'absolute', top: 10, right: 10,
                padding: '3px 9px', borderRadius: 6,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{blog.category}</span>
            </div>

            {/* Body */}
            <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                    color: 'var(--slate-900)', margin: 0, lineHeight: 1.35,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{blog.title}</h3>
                  <span style={statusPill(blog.status)}>{blog.status}</span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)',
                  lineHeight: 1.6, margin: 0,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{blog.excerpt}</p>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-900))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>{blog.author.charAt(0)}</div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--slate-600)' }}>{blog.author}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>·</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--slate-400)' }}>{blog.date}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { Icon: Eye, label: 'View', v: 'default' },
                    { Icon: Send, label: 'Feedback', v: 'orange' },
                    { Icon: Flag, label: 'Flag', v: 'red' },
                  ].map(({ Icon, label, v }) => (
                    <button key={label}
                      title={label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 9px', borderRadius: 8, border: '1px solid var(--glass-border)',
                        background: 'var(--bg-card)', color: 'var(--slate-500)',
                        fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--emerald-600)'; e.currentTarget.style.color = 'var(--emerald-600)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--slate-500)'; }}
                    >
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                </div>
                {blog.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, border: 'none', background: 'var(--status-red-bg)', color: 'var(--status-red-txt)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      <XCircle size={12} /> Reject
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, border: 'none', background: 'var(--emerald-600)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogModeration;