import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CollapsedSidebar from './CollapsedSidebar';
import BottomNav from './BottomNav';
import { logout } from '../services/authService';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  pageTitle?: string;
}

const handleLogout = async () => {
  await logout();
};

const Layout: React.FC<LayoutProps> = ({ children, onLogout, pageTitle = 'Dashboard' }) => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { appUser } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  return (
    <div style={styles.container}>
      {isCollapsed ? (
        <CollapsedSidebar onExpand={toggleSidebar} />
      ) : (
        <Sidebar onLogout={onLogout} />
      )}
      <main 
        className="layout-main-content"
        style={{
          ...styles.main,
          marginLeft: isCollapsed ? '80px' : '260px',
        }}
      >
        {/* Header with Page Title */}
        <div className="layout-header" style={styles.header}>
          <div className="header-left" style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>{pageTitle}</h1>
          </div>
          <div className="header-right" style={styles.headerRight}>
            {appUser?.role === 'artist' && (
              <div onClick={handleProfileClick} style={styles.profileIcon} className="layout-profile-icon">
                <img src="/artist.png" alt="Artist Profile" style={styles.profileImage} />
              </div>
            )}
          </div>
        </div>
        <div style={styles.contentWrapper}>
          <div style={styles.content}>
            {children}
          </div>
        </div>
      </main>
      {/* Mobile Bottom Navigation - Only visible on mobile devices */}
      <BottomNav />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5em',
    background: 'linear-gradient(90deg, #E8F4F5 0%, #c1f8fdff 100%)',
    borderBottom: '1px solid rgba(47, 164, 169, 0.2)',
    boxShadow: '0 4px 16px rgba(47, 164, 169, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  } as React.CSSProperties,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '0rem',
    minHeight: '40px', // Maintain height even when empty
    minWidth: '40px', // Maintain width even when empty
  } as React.CSSProperties,
  profileIcon: {
    color: 'var(--color-primary)',
    cursor: 'pointer',
    transition: 'var(--transition-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  pageTitle: {
    margin: 0,
    fontSize: '1.35rem',
    fontWeight: 700,
    color: 'var(--color-text-primary-light)',
    fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
    letterSpacing: '0px',
  } as React.CSSProperties,
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '2px solid var(--color-primary)',
  } as React.CSSProperties,
  main: {
    marginLeft: '260px',
    flex: 1,
    backgroundColor: 'var(--color-bg-light)',
    height: '100vh',
    transition: 'margin-left 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,
  contentWrapper: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  } as React.CSSProperties,
  content: {
    padding: '0.5rem',
    paddingBottom: '65px', // Match bottom nav height exactly
  } as React.CSSProperties,
};

export default Layout;
