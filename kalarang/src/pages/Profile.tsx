import React from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const capitalizeName = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Layout onLogout={handleLogout} pageTitle="Profile">
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.profileHeader}>
            <div style={styles.profileImageContainer}>
              {appUser?.role === 'artist' ? (
                <img src="/artist.png" alt="Artist Profile" style={styles.profileImage} />
              ) : (
                <img src="/man-with-hat.png" alt="Buyer Profile" style={styles.profileImage} />
              )}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.name}>{appUser?.name ? capitalizeName(appUser.name) : 'User'}</h2>
              <p style={styles.email}>{appUser?.email}</p>
              <span style={styles.roleBadge}>
                {appUser?.role === 'artist' ? '🎨 Artist' : '🎩 Art Lover'}
              </span>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Account Information</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Role:</span>
                <span style={styles.infoValue}>{appUser?.role === 'artist' ? 'Artist' : 'Buyer'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{appUser?.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Member Since:</span>
                <span style={styles.infoValue}>
                  {appUser?.createdAt ? new Date(appUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.comingSoon}>
            <span style={styles.emoji}>⚙️</span>
            <h3 style={styles.comingSoonTitle}>More Features Coming Soon</h3>
            <p style={styles.comingSoonText}>
              Edit profile, manage settings, view activity history, and more.
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
    maxWidth: '900px',
    margin: '0 auto',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '3rem',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(47, 164, 169, 0.1)',
  },
  profileImageContainer: {
    flexShrink: 0,
  },
  profileImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '4px solid var(--color-primary)',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-text-primary-light)',
    marginBottom: '0.5rem',
  },
  email: {
    fontSize: '1.1rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '1rem',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(47, 164, 169, 0.1)',
    color: 'var(--color-primary)',
    borderRadius: '20px',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  section: {
    marginBottom: '2rem',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(47, 164, 169, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--color-text-primary-light)',
    marginBottom: '1.5rem',
  },
  infoGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(47, 164, 169, 0.1)',
  },
  infoLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  infoValue: {
    fontSize: '1rem',
    color: 'var(--color-text-primary-light)',
  },
  comingSoon: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    backgroundColor: 'rgba(47, 164, 169, 0.05)',
    borderRadius: '12px',
    border: '2px dashed rgba(47, 164, 169, 0.2)',
  },
  emoji: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  comingSoonTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: '0.5rem',
  },
  comingSoonText: {
    fontSize: '1rem',
    color: 'var(--color-text-secondary)',
  },
};

export default Profile;
