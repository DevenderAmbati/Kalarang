import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="home-footer" style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '1rem 3rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid var(--primary-alpha-20)',
      backgroundColor: 'var(--color-bg-dark-surface)',
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/test top.png"
          alt="Kalarang"
          className="home-footer-logo"
          style={{ height: '24px', width: 'auto' }}
        />
      </div>

      {/* Links */}
      <div className="home-footer-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <a 
          onClick={() => navigate('/about')}
          style={{ color: 'var(--color-accent)', fontSize: '0.9rem', textDecoration: 'none', cursor: 'pointer' }}
        >
          About
        </a>
        <a href="#" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', textDecoration: 'none' }}>
          Privacy Policy
        </a>
        <a href="#" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', textDecoration: 'none' }}>
          Terms of Service
        </a>
        <a href="#" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', textDecoration: 'none' }}>
          Contact Us
        </a>
        <a href="mailto:support@kalarang.com" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', textDecoration: 'none' }}>
          support@kalarang.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
