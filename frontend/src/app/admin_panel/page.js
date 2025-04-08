"use client";

import { useState, useEffect } from 'react';
import Layout from '../../components/admin_panel/Layout';
import Dashboard from '../../components/admin_panel/Dashboard';
import Boards from '../../components/admin_panel/Boards';
import Clubs from '../../components/admin_panel/Clubs';
import Users from '../../components/admin_panel/Users';
import POR from '../../components/admin_panel/POR';
import AdminManagement from '../../components/admin_panel/ManageAdmin';
import SuperAdminManagement from '../../components/admin_panel/SuperAdminManagement';
import { colors } from '../../color';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'boards':
        return <Boards />;
      case 'clubs':
        return <Clubs />;
      case 'users':
        return <Users />;
      case 'por':
        return <POR />;
      case 'admin_manage':
          return <AdminManagement />;
      case 'super_admin_manage':
          return <SuperAdminManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Premium UI styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      backgroundColor: colors.background.default,
      fontFamily: '"Inter", "Roboto", sans-serif',
    },
    sidebar: {
      backgroundColor: colors.background.sidebar,
      width: isMobile ? '100%' : '280px',
      boxShadow: colors.shadows.card,
      zIndex: 10,
      transition: 'all 0.3s ease',
    },
    content: {
      flex: 1,
      padding: isMobile ? '16px' : '24px',
      backgroundColor: colors.background.default,
      overflow: 'auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '12px 16px' : '20px 24px',
      backgroundColor: colors.background.paper,
      boxShadow: colors.shadows.card,
      borderRadius: '12px',
      marginBottom: '24px',
    },
    headerTitle: {
      color: colors.primary.main.replace(/`/g, ''),
      fontSize: isMobile ? '1.5rem' : '1.75rem',
      fontWeight: 700,
      margin: 0,
    },
    tabContainer: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '24px',
    },
    tab: {
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    },
    activeTab: {
      backgroundColor: colors.primary.main.replace(/`/g, ''),
      color: colors.text.white.replace(/`/g, ''),
      boxShadow: colors.shadows.card,
    },
    inactiveTab: {
      backgroundColor: 'transparent',
      color: colors.text.primary.replace(/`/g, ''),
      '&:hover': {
        backgroundColor: colors.action.hover.replace(/`/g, ''),
      },
    },
    contentCard: {
      backgroundColor: colors.background.paper,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: colors.shadows.card,
    },
    statusBadge: (status) => ({
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.875rem',
      fontWeight: 500,
      backgroundColor: colors.status[status].replace(/`/g, ''),
      color: colors.text.white.replace(/`/g, ''),
    }),
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      backgroundColor: colors.primary.main.replace(/`/g, ''),
      color: colors.text.white.replace(/`/g, ''),
      border: 'none',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: colors.primary.dark.replace(/`/g, ''),
        boxShadow: colors.shadows.hover,
      },
    },
    secondaryButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: colors.primary.main.replace(/`/g, ''),
      border: `1px solid ${colors.primary.main.replace(/`/g, '')}`,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: colors.action.hover.replace(/`/g, ''),
      },
    },
  };

  // Custom tab component
  const Tab = ({ name, label }) => {
    const isActive = activeTab === name;
    const tabStyle = {
      ...styles.tab,
      ...(isActive ? styles.activeTab : styles.inactiveTab),
    };

    return (
      <div style={tabStyle} onClick={() => setActiveTab(name)}>
        {label}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} colors={colors}>

        {/* Mobile Tab Navigation */}
        {isMobile && (
          <div style={styles.tabContainer}>
            <Tab name="dashboard" label="Dashboard" />
            <Tab name="boards" label="Boards" />
            <Tab name="clubs" label="Clubs" />
            <Tab name="users" label="Users" />
            <Tab name="por" label="POR" />
            <Tab name="admin_manage" label="Admin Management" />
            <Tab name="Super admin_manage" label="Super Admin Management" />
          </div>
        )}

        <div style={styles.contentCard}>
          {renderTab()}
        </div>
      </Layout>
    </div>
  );
}