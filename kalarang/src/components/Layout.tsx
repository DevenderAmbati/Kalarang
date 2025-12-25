import React from 'react';
import Sidebar from './Sidebar';
import { logout } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const handleLogout = async () => {
  await logout();
};

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  return (
    <div style={styles.container}>
      <Sidebar onLogout={onLogout} />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    backgroundColor: 'var(--color-bg-light)',
    minHeight: '100vh',
  },
};

export default Layout;
