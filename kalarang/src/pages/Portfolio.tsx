import React from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Layout onLogout={handleLogout} pageTitle="Portfolio">
      <div style={styles.container}>
        <div style={styles.content}>
          <h2 style={styles.heading}>Your Portfolio</h2>
          <p style={styles.description}>
            Manage your private gallery and published artworks.
          </p>
          
          <div style={styles.comingSoon}>
            <span style={styles.emoji}>💼</span>
            <h3 style={styles.comingSoonTitle}>Coming Soon</h3>
            <p style={styles.comingSoonText}>
              Upload artwork to your private gallery, refine details, and publish when ready. Full control over your art collection.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    minHeight: '100%',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-text-primary-light)',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '1.1rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '3rem',
  },
  comingSoon: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: 'rgba(47, 164, 169, 0.05)',
    borderRadius: '12px',
    border: '2px dashed rgba(47, 164, 169, 0.2)',
  },
  emoji: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  comingSoonTitle: {
    fontSize: '1.75rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: '1rem',
  },
  comingSoonText: {
    fontSize: '1.1rem',
    color: 'var(--color-text-secondary)',
  },
};

export default Portfolio;
