import React, { useContext, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Store,
  LogOut,
  X,
  Leaf,
  Sprout,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import SidebarItem from '../../components/admin/SidebarItem.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import UserTable from '../../components/admin/UserTable.jsx';
import BlogModeration from '../../components/admin/BlogModeration.jsx';
import DiseaseRegistry from '../../components/admin/DiseaseRegistry.jsx';
import MarketplaceManagement from '../../components/admin/MarketplaceManagement.jsx';
import AdminSettings from '../../components/admin/AdminSettings.jsx';
import { Context } from '../../context/Context.js';
import Logo from '../../components/logo/Logo.jsx';

const TOPBAR_HEIGHT = 70;
const SIDEBAR_WIDTH = 260;

export default function AdminPanel() {
  const { adminSidebarOpen, dispatch } = useContext(Context);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch real dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/users/admin/stats");
        const data = res.data;
        const realStats = [
          { title: "Total Users", value: data.totalUsers.toLocaleString(), change: data.userChange, icon: Users, color: "bg-blue-500" },
          { title: "Total Posts", value: data.totalPosts.toLocaleString(), change: data.postChange, icon: FileText, color: "bg-green-500" },
        ];
        setStats(realStats);
        setTotalRecords(data.totalUsers + data.totalPosts);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        // Fallback stats on error
        setStats([
          { title: "Total Users", value: "—", change: "0%", icon: Users, color: "bg-blue-500" },
          { title: "Total Posts", value: "—", change: "0%", icon: FileText, color: "bg-green-500" },
        ]);
      }
    };
    fetchStats();
  }, []);

  // Auto-open sidebar on large screens
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handle = (e) => {
      if (e.matches) dispatch({ type: 'SET_ADMIN_SIDEBAR', payload: true });
    };
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch({ type: 'SET_ADMIN_TAB', payload: tab });
    // Close sidebar on mobile after selecting
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      dispatch({ type: 'SET_ADMIN_SIDEBAR', payload: false });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length || 1}, 1fr)`, gap: 20 }}>
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
            <div>
              <UserTable />
            </div>
          </div>
        );
      case 'users':
        return <UserTable />;
      case 'blogs':
        return <BlogModeration />;
      case 'diseases':
        return <DiseaseRegistry />;
      case 'marketplace':
        return <MarketplaceManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 20,
            border: '1px solid var(--glass-border)',
            padding: 64,
            textAlign: 'center',
            color: 'var(--slate-600)',
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 500,
          }}>
            Coming Soon
          </div>
        );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'users': return 'User Management';
      case 'blogs': return 'Blog Moderation';
      case 'diseases': return 'Disease Database';
      case 'marketplace': return 'Marketplace';
      case 'settings': return 'Settings';
      default: return 'AgroLink Admin';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return `${totalRecords} total records`;
      case 'users': return 'Manage registered users';
      case 'blogs': return 'Review and moderate posts';
      case 'diseases': return 'Browse disease entries';
      case 'marketplace': return 'Monitor listings and orders';
      case 'settings': return 'Database, profile & security';
      default: return '';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-snow)',
      display: 'flex',
      fontFamily: 'var(--font-body)',
      color: 'var(--slate-900)',
    }}>

      {/* Mobile overlay — closes sidebar when clicking outside */}
      {adminSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, top: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 30 }}
          className="lg:hidden"
          onClick={() => dispatch({ type: 'SET_ADMIN_SIDEBAR', payload: false })}
        />
      )}

      {/* Sidebar — glass-panel matching the Topbar design */}
      <aside
        className="adminSidebar"
        style={{
          width: SIDEBAR_WIDTH,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--glass-zen)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid var(--glass-border)',
          boxShadow: '4px 0 32px rgba(6,78,59,0.1)',
          transform: adminSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >

        {/* Logo header — same height as Topbar, same glass styling = one seamless bar */}
        <div style={{
          height: TOPBAR_HEIGHT,
          minHeight: TOPBAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 0 20px',
          borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Logo />
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_ADMIN_SIDEBAR', payload: false })}
            className="themeToggle"
            aria-label="Close sidebar"
          >
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
          {/* Section label */}
          <p style={{
            padding: '0 14px',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--slate-400)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 6,
            fontFamily: 'var(--font-display)',
          }}>Navigation</p>

          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />
          <SidebarItem icon={Users} label="User Management" active={activeTab === 'users'} onClick={() => handleTabChange('users')} />
          <SidebarItem icon={FileText} label="Blog Moderation" active={activeTab === 'blogs'} onClick={() => handleTabChange('blogs')} />
          <SidebarItem icon={Store} label="Marketplace" active={activeTab === 'marketplace'} onClick={() => handleTabChange('marketplace')} />
          <SidebarItem icon={Leaf} label="Disease Data" active={activeTab === 'diseases'} onClick={() => handleTabChange('diseases')} />

          <div style={{ margin: '16px 0 6px', height: 1, background: 'var(--glass-border)' }} />

          <p style={{
            padding: '0 14px',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--slate-400)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 6,
            fontFamily: 'var(--font-display)',
          }}>System</p>

          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} />
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--glass-border)' }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 14,
              background: 'transparent',
              border: 'none',
              color: 'var(--slate-600)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--slate-600)';
            }}
            onClick={() => dispatch({ type: 'LOGOUT' })}
          >
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.08)', flexShrink: 0,
            }}>
              <LogOut size={17} />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>


      {/* Main content — offset when sidebar is open on desktop */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        transition: 'padding-left 0.3s var(--ease-zen)',
        paddingLeft: adminSidebarOpen ? SIDEBAR_WIDTH : 0,
      }}>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}