import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Leaf, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../context/Context';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const statusStyles = {
  pending: {
    bg: 'var(--status-yellow-bg)',
    color: 'var(--status-yellow-txt)',
    border: 'var(--status-yellow-border)',
  },
  approved: {
    bg: 'var(--status-green-bg)',
    color: 'var(--status-green-txt)',
    border: 'var(--status-green-border)',
  },
  rejected: {
    bg: 'var(--status-red-bg)',
    color: 'var(--status-red-txt)',
    border: 'var(--status-red-border)',
  },
};

function formatSubmittedDate(value) {
  if (!value) return 'Unknown date';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return date.toLocaleString();
}

function normalizeStatus(value) {
  const status = typeof value === 'string' ? value.toLowerCase() : 'pending';
  return statusStyles[status] ? status : 'pending';
}

const DiseaseRegistry = () => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchArticles = async () => {
      if (!user?.isAdmin || !user?._id) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await axios.get(`/knowledge/admin/list?userId=${user._id}`);
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load disease submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user]);

  const counts = useMemo(() => {
    const summary = {
      all: items.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    items.forEach((item) => {
      const status = normalizeStatus(item.status);
      summary[status] += 1;
    });

    return summary;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((item) => normalizeStatus(item.status) === activeTab);
  }, [activeTab, items]);

  const handleStatusUpdate = async (articleId, nextStatus) => {
    if (!user?._id) return;

    setBusyId(articleId);
    setError('');

    try {
      const res = await axios.put(`/knowledge/${articleId}/${nextStatus}`, { userId: user._id });
      const updatedArticle = res.data?.article;

      setItems((current) =>
        current.map((item) => (item._id === articleId ? updatedArticle || { ...item, status: nextStatus } : item)),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${nextStatus === 'approve' ? 'approve' : 'reject'} this disease submission.`,
      );
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (articleId) => {
    if (!user?._id) return;

    const shouldDelete = window.confirm('Delete this approved disease information?');
    if (!shouldDelete) return;

    setBusyId(articleId);
    setError('');

    try {
      await axios.delete(`/knowledge/admin/${articleId}`, { data: { userId: user._id } });
      setItems((current) => current.filter((item) => item._id !== articleId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete this disease information.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 20,
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-zen)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--glass-border)',
        background: 'var(--bg-surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            color: 'var(--slate-900)', margin: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Leaf size={17} style={{ color: 'var(--emerald-600)' }} />
            Disease Knowledge Base
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>
            {loading ? 'Loading disease submissions...' : `${counts[activeTab]} ${activeTab} submissions`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/knowledge/admin/new')}
          style={{
            padding: '7px 16px', borderRadius: 10, border: 'none',
            background: 'var(--emerald-600)', color: '#fff',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--emerald-700)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--emerald-600)'; }}
        >
          + Add New
        </button>
      </div>

      <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: `1px solid ${isActive ? 'var(--emerald-600)' : 'var(--glass-border)'}`,
                  background: isActive ? 'var(--mint-100)' : 'var(--bg-card)',
                  color: isActive ? 'var(--emerald-700)' : 'var(--slate-600)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {tab.label} ({counts[tab.key]})
              </button>
            );
          })}
        </div>

        {error ? (
          <div style={{
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid var(--status-red-border)',
            background: 'var(--status-red-bg)',
            color: 'var(--status-red-txt)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          }}>
            {error}
          </div>
        ) : null}

        {loading ? (
          <div style={{
            padding: '14px 18px',
            borderRadius: 14,
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-card)',
            color: 'var(--slate-500)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          }}>
            Loading disease submissions...
          </div>
        ) : visibleItems.length === 0 ? (
          <div style={{
            padding: '14px 18px',
            borderRadius: 14,
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-card)',
            color: 'var(--slate-500)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          }}>
            No {activeTab === 'all' ? '' : `${activeTab} `}disease submissions right now.
          </div>
        ) : (
          visibleItems.map((article) => {
            const cropName = article.diseaseId?.cropId?.name || 'Unknown Crop';
            const diseaseName = article.diseaseId?.diseaseName || 'Unknown Disease';
            const status = normalizeStatus(article.status);
            const statusStyle = statusStyles[status];
            const isPending = status === 'pending';
            const isApproved = status === 'approved';
            const isBusy = busyId === article._id;
            const submitterName =
              article.submittedBy?.name ||
              article.submittedBy?.username ||
              article.submittedBy?.email ||
              'Unknown user';
            const submitterEmail = article.submittedBy?.email || '';
            const submitterLabel =
              submitterEmail && submitterName !== submitterEmail
                ? `${submitterName} (${submitterEmail})`
                : submitterName;

            return (
              <div
                key={article._id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.2s var(--ease-zen)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--emerald-600)'; e.currentTarget.style.background = 'var(--mint-100)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AlertCircle size={18} style={{ color: statusStyle.color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--slate-900)',
                      margin: 0,
                    }}>
                      {article.title || 'Untitled Submission'}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 1 }}>
                      Crop: <strong style={{ color: 'var(--slate-600)' }}>{cropName}</strong>
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 1 }}>
                      Disease: <strong style={{ color: 'var(--slate-600)' }}>{diseaseName}</strong>
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 1 }}>
                      Submitted by: <strong style={{ color: 'var(--slate-600)' }}>{submitterLabel}</strong>
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--slate-500)', marginTop: 1 }}>
                      Submitted: <strong style={{ color: 'var(--slate-600)' }}>{formatSubmittedDate(article.createdAt)}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--slate-400)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</p>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
                      background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                      textTransform: 'capitalize',
                    }}>
                      {status}
                    </span>
                  </div>

                  {isPending ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(article._id, 'approve')}
                        disabled={isBusy}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 10,
                          border: 'none',
                          background: isBusy ? 'var(--slate-400)' : 'var(--emerald-600)',
                          color: '#fff',
                          fontFamily: 'var(--font-display)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isBusy ? 'Updating...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(article._id, 'reject')}
                        disabled={isBusy}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 10,
                          border: 'none',
                          background: isBusy ? 'var(--slate-400)' : '#ef4444',
                          color: '#fff',
                          fontFamily: 'var(--font-display)',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isBusy ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  ) : null}

                  {isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(article._id)}
                      disabled={isBusy}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 10,
                        border: 'none',
                        background: isBusy ? 'var(--slate-400)' : '#ef4444',
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isBusy ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DiseaseRegistry;
