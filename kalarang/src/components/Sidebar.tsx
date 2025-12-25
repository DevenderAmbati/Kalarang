import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.brandName}>Kalarang</h2>
      </div>

      <nav style={styles.nav}>
        <Link
          to="/home"
          style={{
            ...styles.navItem,
            ...(isActive('/home') ? styles.navItemActive : {}),
          }}
        >
          <span style={styles.icon}>🏠</span>
          <span>Home</span>
        </Link>

        <Link
          to="/upload"
          style={{
            ...styles.navItem,
            ...(isActive('/upload') ? styles.navItemActive : {}),
          }}
        >
          <span style={styles.icon}>⬆️</span>
          <span>Upload Artwork</span>
        </Link>

        <Link
          to="/my-artworks"
          style={{
            ...styles.navItem,
            ...(isActive('/my-artworks') ? styles.navItemActive : {}),
          }}
        >
          <span style={styles.icon}>🖼️</span>
          <span>My Artworks</span>
        </Link>

        <Link
          to="/profile"
          style={{
            ...styles.navItem,
            ...(isActive('/profile') ? styles.navItemActive : {}),
          }}
        >
          <span style={styles.icon}>👤</span>
          <span>Profile</span>
        </Link>
      </nav>

      <div style={styles.footer}>
        <button onClick={onLogout} style={styles.logoutBtn}>
          <span style={styles.icon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: 'var(--color-bg-dark)',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    left: 0,
    top: 0,
    boxShadow: 'var(--shadow-md)',
  },
  header: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid var(--white-alpha-10)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logo: {
    fontSize: '2rem',
  },
  brandName: {
    color: 'var(--color-text-primary-dark)',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
  },
  nav: {
    flex: 1,
    padding: '1.5rem 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'all var(--transition-base)',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    backgroundColor: 'var(--white-alpha-10)',
    color: 'var(--color-text-primary-dark)',
    borderLeft: '3px solid var(--color-primary)',
  },
  icon: {
    fontSize: '1.2rem',
    width: '24px',
    textAlign: 'center' as const,
  },
  footer: {
    padding: '1.5rem',
    borderTop: '1px solid var(--white-alpha-10)',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--white-alpha-20)',
    borderRadius: '8px',
    color: 'var(--color-text-secondary)',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
  },
};

export default Sidebar;
