import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isEditingWhatsApp, setIsEditingWhatsApp] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveWhatsApp = () => {
    // TODO: Save WhatsApp number to database
    console.log('Saving WhatsApp number:', whatsappNumber);
    setIsEditingWhatsApp(false);
  };

  const handleSendMessage = async () => {
    if (!supportMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSendingMessage(true);
    try {
      // TODO: Implement actual email sending via backend API
      const emailData = {
        to: 'kalarang.team@gmail.com',
        from: appUser?.email || 'anonymous',
        subject: `Support/Suggestion from ${appUser?.name || 'User'}`,
        message: supportMessage,
        userName: appUser?.name || 'Anonymous',
        userEmail: appUser?.email || 'Not provided'
      };
      
      console.log('Sending email:', emailData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessageSent(true);
      setSupportMessage('');
      setTimeout(() => setMessageSent(false), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deleting your account');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you absolutely sure? This action cannot be undone. Your account and all data will be permanently deleted.'
    );

    if (!confirmDelete) return;

    setIsDeletingAccount(true);
    try {
      // TODO: Implement actual account deletion via backend API
      const deleteData = {
        userId: appUser?.uid,
        userName: appUser?.name,
        userEmail: appUser?.email,
        reason: deleteReason,
        timestamp: new Date().toISOString()
      };
      
      console.log('Deleting account:', deleteData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Your account has been deleted. You will be logged out.');
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
      setIsDeletingAccount(false);
    }
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
              <div style={styles.badgeRow}>
                <span style={styles.roleBadge}>
                  {appUser?.role === 'artist' ? '🎨 Artist' : '🎩 Art Lover'}
                </span>
                <span style={styles.memberSince}>
                  since {appUser?.createdAt ? new Date(appUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Section for Artists */}
          {appUser?.role === 'artist' && (
            <div style={styles.whatsappSection}>
              <div style={styles.whatsappHeader}>
                <span style={styles.whatsappLabel}> WhatsApp Number</span>
                {!isEditingWhatsApp && (
                  <button 
                    onClick={() => setIsEditingWhatsApp(true)} 
                    style={{
                      ...styles.editButton,
                      ...(hoveredButton === 'edit' ? {
                        background: 'var(--gradient-primary-hover)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(47, 164, 169, 0.3)',
                      } : {})
                    }}
                    onMouseEnter={() => setHoveredButton('edit')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    {whatsappNumber ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>
              {isEditingWhatsApp ? (
                <div style={styles.whatsappEditContainer}>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Enter here"
                    style={styles.whatsappInput}
                  />
                  <button 
                    onClick={handleSaveWhatsApp} 
                    style={{
                      ...styles.saveButton,
                      ...(hoveredButton === 'save' ? {
                        background: 'var(--gradient-primary-hover)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(47, 164, 169, 0.3)',
                      } : {})
                    }}
                    onMouseEnter={() => setHoveredButton('save')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditingWhatsApp(false)} 
                    style={{
                      ...styles.cancelButton,
                      ...(hoveredButton === 'cancel' ? {
                        background: 'var(--primary-alpha-10)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 4px rgba(47, 164, 169, 0.2)',
                      } : {})
                    }}
                    onMouseEnter={() => setHoveredButton('cancel')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={styles.whatsappDisplay}>
                  {whatsappNumber || 'Not added yet'}
                </div>
              )}
            </div>
          )}

          {/* Support & Suggestions Section */}
          <div style={styles.supportSection}>
            <div style={styles.supportHeader}>
              <span style={styles.supportLabel}>💬 Support & Suggestions</span>
            </div>
            <p style={styles.supportDescription}>
              Have feedback or need help? Send us a message and we'll get back to you at kalarang.team@gmail.com
            </p>
            <textarea
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Type your message here..."
              style={styles.messageTextarea}
              rows={4}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isSendingMessage || !supportMessage.trim()}
              style={{
                ...styles.sendButton,
                ...(hoveredButton === 'send' && supportMessage.trim() ? {
                  background: 'var(--gradient-primary-hover)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(47, 164, 169, 0.3)',
                } : {}),
                ...(isSendingMessage || !supportMessage.trim() ? {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                } : {})
              }}
              onMouseEnter={() => setHoveredButton('send')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {isSendingMessage ? 'Sending...' : messageSent ? '✓ Sent!' : 'Send Message'}
            </button>
          </div>

          {/* Account Actions Section */}
          <div style={styles.accountActionsSection}>
            <div style={styles.supportHeader}>
              <span style={styles.supportLabel}> Account Actions</span>
            </div>
            
            {!showDeleteConfirm ? (
              <div style={styles.actionButtonsContainer}>
                <button 
                  onClick={handleLogout}
                  style={{
                    ...styles.logoutButton,
                    ...(hoveredButton === 'logout' ? {
                      background: 'var(--gradient-primary-hover)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(47, 164, 169, 0.3)',
                    } : {})
                  }}
                  onMouseEnter={() => setHoveredButton('logout')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Logout
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    ...styles.deleteButton,
                    ...(hoveredButton === 'delete' ? {
                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                    } : {})
                  }}
                  onMouseEnter={() => setHoveredButton('delete')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Delete Account
                </button>
              </div>
            ) : (
              <div style={styles.deleteConfirmContainer}>
                <p style={styles.deleteWarning}>
                  ⚠️ Warning: This action is permanent and cannot be undone.
                </p>
                <p style={styles.supportDescription}>
                  Please tell us why you're leaving (required):
                </p>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  style={styles.messageTextarea}
                  rows={3}
                />
                <div style={styles.actionButtonsContainer}>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || !deleteReason.trim()}
                    style={{
                      ...styles.confirmDeleteButton,
                      ...(isDeletingAccount || !deleteReason.trim() ? {
                        opacity: 0.6,
                        cursor: 'not-allowed',
                      } : {}),
                      ...(hoveredButton === 'confirmDelete' && deleteReason.trim() ? {
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                      } : {})
                    }}
                    onMouseEnter={() => setHoveredButton('confirmDelete')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteReason('');
                    }}
                    disabled={isDeletingAccount}
                    style={{
                      ...styles.cancelButton,
                      ...(hoveredButton === 'cancelDelete' ? {
                        background: 'var(--primary-alpha-10)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 4px rgba(47, 164, 169, 0.2)',
                      } : {})
                    }}
                    onMouseEnter={() => setHoveredButton('cancelDelete')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    padding: '1rem 1rem',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(47, 164, 169, 0.1)',
  },
  profileImageContainer: {
    flexShrink: 0,
  },
  profileImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '3px solid var(--color-primary)',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary-light)',
    marginBottom: '0.3rem',
  },
  email: {
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.6rem',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  memberSince: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.4rem 0.8rem',
    backgroundColor: 'rgba(47, 164, 169, 0.1)',
    color: 'var(--color-primary)',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  whatsappSection: {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(47, 164, 169, 0.1)',
  },
  whatsappHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  whatsappLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary-light)',
  },
  whatsappDisplay: {
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  whatsappEditContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  whatsappInput: {
    flex: '1',
    minWidth: '200px',
    padding: '0.5rem 0.8rem',
    fontSize: '0.95rem',
    border: '2px solid var(--color-border)',
    borderRadius: '8px',
    outline: 'none',
    color: 'var(--color-text-dark)',
    transition: 'all 0.2s ease',
  },
  'whatsappInput:focus': {
    borderColor: 'var(--color-focus)',
    boxShadow: '0 0 0 3px var(--color-focus-glow)',
  },
  editButton: {
    padding: '0.4rem 1rem',
    background: 'var(--gradient-primary)',
    color: 'var(--color-text-primary-dark)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(47, 164, 169, 0.2)',
  },
  saveButton: {
    padding: '0.5rem 1.2rem',
    background: 'var(--gradient-primary)',
    color: 'var(--color-text-primary-dark)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(47, 164, 169, 0.2)',
  },
  cancelButton: {
    padding: '0.5rem 1.2rem',
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  supportSection: {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(47, 164, 169, 0.1)',
    marginTop: '1.5rem',
  },
  supportHeader: {
    marginBottom: '0.75rem',
  },
  supportLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary-light)',
  },
  supportDescription: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  messageTextarea: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.95rem',
    border: '2px solid var(--color-border)',
    borderRadius: '8px',
    outline: 'none',
    color: 'var(--color-text-dark)',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    transition: 'all 0.2s ease',
    marginBottom: '1rem',
    minHeight: '100px',
  },
  sendButton: {
    padding: '0.5rem 1.5rem',
    background: 'var(--gradient-primary)',
    color: 'var(--color-text-primary-dark)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(47, 164, 169, 0.2)',
    width: '100%',
  },
  accountActionsSection: {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(47, 164, 169, 0.1)',
    marginTop: '1.5rem',
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  logoutButton: {
    flex: '1',
    minWidth: '150px',
    padding: '0.75rem 1.5rem',
    background: 'var(--gradient-primary)',
    color: 'var(--color-text-primary-dark)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(47, 164, 169, 0.2)',
  },
  deleteButton: {
    flex: '1',
    minWidth: '150px',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteConfirmContainer: {
    marginTop: '1rem',
  },
  deleteWarning: {
    fontSize: '0.95rem',
    color: '#dc2626',
    fontWeight: 600,
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: '8px',
    borderLeft: '4px solid #dc2626',
  },
  confirmDeleteButton: {
    flex: '1',
    minWidth: '150px',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
