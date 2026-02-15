import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import AboutTab from '../../components/Profile/AboutTab';
import EditProfile, { ProfileData } from '../../components/Profile/EditProfile';
import PublishedWorks from '../artwork/PublishedWorks';
import Gallery from './Gallery';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState('published');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleShareProfile = () => {
    // TODO: Implement profile sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `${mockUser.name}'s Portfolio`,
        text: `Check out ${mockUser.name}'s amazing artwork collection on Kalarang!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  // Mock user data - in real app, this would come from appUser or API
  const mockUser = {
    name: appUser?.name || 'Artist Name',
    username: appUser?.username,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=face',
    bannerImage: '/logo.jpeg',
    stats: {
      followers: 1247,
      artworks: 89,
      following: 234,
    },
  };

  // Profile data for editing
  const [profileData, setProfileData] = useState<ProfileData>({
    name: mockUser.name,
    avatar: mockUser.avatar,
    bannerImage: mockUser.bannerImage,
    bio: "Welcome to my creative space! I'm a passionate artist dedicated to bringing imagination to life through various mediums. My work explores the interplay between light and shadow, emotion and form, creating pieces that invite viewers to discover their own interpretations and connections.",
    artStyle: ["Oil Painting", "Digital Art", "Mixed Media", "Abstract", "Portraiture", "Landscape"],
    philosophy: "I believe art has the power to connect people across cultures and experiences. Through my work, I aim to create pieces that resonate on both emotional and aesthetic levels, inviting viewers to explore their own interpretations and find personal meaning within each creation.",
    achievements: [
      "Winner of the Annual Contemporary Art Award 2024",
      "Featured Artist in Modern Gallery Exhibition 2023",
      "Recognition for Outstanding Digital Art Innovation"
    ],
    exhibitions: [
      { year: "2024", title: "Contemporary Visions - Metropolitan Gallery" },
      { year: "2023", title: "Modern Expressions - Art District Showcase" },
      { year: "2022", title: "Digital Renaissance - Tech Art Festival" }
    ],
    education: [
      "Master of Fine Arts – School of Aryan",
      "Bachelor of Fine Arts – School of The Arts"
    ],
    commissionStatus: 'Open',
    commissionDescription: "I'm currently accepting commissions for custom artwork. Let's bring your vision to life!",
    commissionCtaText: "Get in Touch",
    links: [
      { label: "Instagram", url: "https://instagram.com/artist", icon: "instagram" },
      { label: "Portfolio", url: "https://portfolio.com", icon: "portfolio" }
    ]
  });

  const handleSaveProfile = (data: ProfileData) => {
    setProfileData(data);
    setIsEditingProfile(false);
    // TODO: Here you would save to your backend/database
    console.log('Saving profile data:', data);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
  };

  const handleBannerUpdate = (newBannerUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      bannerImage: newBannerUrl
    }));
    console.log('Banner updated:', newBannerUrl);
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      avatar: newAvatarUrl
    }));
    console.log('Avatar updated:', newAvatarUrl);
  };

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'published', label: 'Published Works' },
    { id: 'gallery', label: 'Gallery' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab 
          bio={profileData.bio}
          artStyle={profileData.artStyle}
          philosophy={profileData.philosophy}
          achievements={profileData.achievements}
          exhibitions={profileData.exhibitions}
          education={profileData.education}
          commissions={{
            status: profileData.commissionStatus,
            description: profileData.commissionDescription,
            ctaText: profileData.commissionCtaText
          }}
          links={profileData.links}
        />;
      case 'published':
        return <PublishedWorks />;
      case 'gallery':
        return <Gallery />;
      default:
        return <AboutTab 
          bio={profileData.bio}
          artStyle={profileData.artStyle}
          philosophy={profileData.philosophy}
          achievements={profileData.achievements}
          exhibitions={profileData.exhibitions}
          education={profileData.education}
          commissions={{
            status: profileData.commissionStatus,
            description: profileData.commissionDescription,
            ctaText: profileData.commissionCtaText
          }}
          links={profileData.links}
        />;
    }
  };

  return (
    <Layout onLogout={handleLogout} pageTitle="Portfolio">
      <div style={styles.container}>
        <div style={styles.content}>
          <ProfileHeader
            user={{
              name: profileData.name,
              username: mockUser.username,
              avatar: profileData.avatar,
              bannerImage: profileData.bannerImage,
              stats: mockUser.stats
            }}
            onEditProfile={handleEditProfile}
            onShareProfile={handleShareProfile}
            onBannerUpdate={handleBannerUpdate}
            onAvatarUpdate={handleAvatarUpdate}
            isOwner={true}
          />
          
          <div style={styles.tabSection}>
            <div style={styles.tabContainer}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === tab.id ? styles.activeTabButton : {}),
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div style={styles.tabContent}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <EditProfile
          profileData={profileData}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
        />
      )}
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
    padding: '0 0.5rem',
  },
  tabSection: {
    marginTop: '1.5rem',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '2rem',
    gap: '0',
    overflowX: 'auto' as const,
    paddingBottom: '0',
    '@media (min-width: 640px) and (max-width: 1023px)': {
      gap: '0.25rem',
      justifyContent: 'flex-start',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
    '@media (max-width: 639px)': {
      gap: '0.25rem',
      justifyContent: 'flex-start',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    },
  },
  tabButton: {
    position: 'relative' as const,
    padding: '1rem 2rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap' as const,
    borderBottom: '3px solid transparent',
    '@media (min-width: 640px) and (max-width: 1023px)': {
      padding: '0.875rem 1.5rem',
      fontSize: '0.9rem',
    },
    '@media (max-width: 639px)': {
      padding: '0.875rem 1.5rem',
      fontSize: '0.9rem',
    },
    '@media (max-width: 480px)': {
      padding: '0.75rem 1.25rem',
      fontSize: '0.85rem',
    },
  },
  activeTabButton: {
    color: 'var(--color-primary)',
    fontWeight: 600,
    borderBottom: '3px solid var(--color-primary)',
    backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)',
  },
  tabContent: {
    minHeight: '400px',
  },
  emoji: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  comingSoonTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: '0.75rem',
  },
  comingSoonText: {
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
};

export default Portfolio;
