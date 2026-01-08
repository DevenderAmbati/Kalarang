import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Upload artwork:', { title, price, category, description });
    // Firebase upload will be integrated here later
  };

  return (
    <Layout onLogout={handleLogout} pageTitle="Upload Artwork">
      <div style={styles.container}>
        <p style={styles.subtitle}>Share your masterpiece with the world</p>

        <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.uploadArea}>
          <div style={styles.uploadBox}>
            <span style={styles.uploadIcon}>📸</span>
            <p style={styles.uploadText}>Click to upload image</p>
            <p style={styles.uploadSubtext}>PNG, JPG up to 10MB</p>
            <input type="file" accept="image/*" style={styles.fileInput} />
          </div>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Artwork Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sunset in Mountains"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Price (₹) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 5000"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Select a category</option>
              <option value="painting">Painting</option>
              <option value="digital">Digital Art</option>
              <option value="sculpture">Sculpture</option>
              <option value="photography">Photography</option>
              <option value="mixed-media">Mixed Media</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your artwork..."
              style={{ ...styles.input, minHeight: '100px', resize: 'vertical' as const }}
            />
          </div>
        </div>

        <button type="submit" style={styles.submitBtn}>
          Publish Artwork
        </button>
      </form>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '2rem',
  },
  form: {
    backgroundColor: 'var(--color-bg-white)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: 'var(--shadow-sm)',
  },
  uploadArea: {
    marginBottom: '2rem',
  },
  uploadBox: {
    border: '2px dashed var(--color-primary)',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'all var(--transition-base)',
  },
  uploadIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  uploadText: {
    fontSize: '1.1rem',
    color: 'var(--color-royal)',
    fontWeight: '600',
    margin: '0.5rem 0',
  },
  uploadSubtext: {
    fontSize: '0.9rem',
    color: 'var(--color-primary-dark)',
    margin: 0,
  },
  fileInput: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    color: 'var(--color-royal)',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  input: {
    padding: '0.9rem 1rem',
    fontSize: '1rem',
    border: '2px solid var(--color-border)',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color var(--transition-base)',
    fontFamily: 'inherit',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--color-text-primary-dark)',
    background: 'var(--gradient-primary)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-base)',
  },
};

export default Upload;