import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import ArtworkCard from '../components/ArtworkCard';
import './homeFeed.css';

interface Story {
  id: number;
  image: string;
  name: string;
  userIcon: string;
  price: string;
}

const HomeFeed: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<number>>(new Set());
  const [currentSessionViewed, setCurrentSessionViewed] = useState<Set<number>>(new Set());

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
    setCurrentSessionViewed(new Set([story.id]));
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
    // Mark all stories viewed in this session as viewed
    setViewedStories(prev => {
      const newSet = new Set(prev);
      currentSessionViewed.forEach(id => newSet.add(id));
      return newSet;
    });
    setCurrentSessionViewed(new Set());
  };

  const handlePreviousStory = () => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
    if (currentIndex > 0) {
      const prevStory = stories[currentIndex - 1];
      setSelectedStory(prevStory);
      setCurrentSessionViewed(prev => new Set(prev).add(prevStory.id));
    }
  };

  const handleNextStory = () => {
    if (!selectedStory) return;
    const currentIndex = stories.findIndex(s => s.id === selectedStory.id);
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      setSelectedStory(nextStory);
      setCurrentSessionViewed(prev => new Set(prev).add(nextStory.id));
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Left third of the image
    if (clickX < width / 3) {
      handlePreviousStory();
    }
    // Right third of the image
    else if (clickX > (width * 2) / 3) {
      handleNextStory();
    }
  };

  // Sample stories data - using artwork placeholders
  const stories: Story[] = [
    { id: 1, image: 'https://picsum.photos/300/300?random=1', name: 'Artist One', userIcon: '/artist.png', price: '₹12,500' },
    { id: 2, image: 'https://picsum.photos/300/300?random=2', name: 'Artist Two', userIcon: '/artist.png', price: '₹8,900' },
    { id: 3, image: 'https://picsum.photos/300/300?random=3', name: 'Artist Three', userIcon: '/artist.png', price: '₹15,000' },
    { id: 4, image: 'https://picsum.photos/300/300?random=4', name: 'Artist Four', userIcon: '/artist.png', price: '₹22,000' },
    { id: 5, image: 'https://picsum.photos/300/300?random=5', name: 'Artist Five', userIcon: '/artist.png', price: '₹18,750' },
    { id: 6, image: 'https://picsum.photos/300/300?random=6', name: 'Artist Six', userIcon: '/artist.png', price: '₹10,500' },
    { id: 7, image: 'https://picsum.photos/300/300?random=7', name: 'Artist Seven', userIcon: '/artist.png', price: '₹25,000' },
    { id: 8, image: 'https://picsum.photos/300/300?random=8', name: 'Artist Eight', userIcon: '/artist.png', price: '₹14,200' },
    { id: 9, image: 'https://picsum.photos/300/300?random=9', name: 'Artist Nine', userIcon: '/artist.png', price: '₹19,999' },
    { id: 10, image: 'https://picsum.photos/300/300?random=10', name: 'Artist Ten', userIcon: '/artist.png', price: '₹16,800' },
  ];

  // Sample artwork data for cards
  const artworks = [
    {
      id: 1,
      artworkImage: 'https://picsum.photos/400/300?random=11',
      artistAvatar: '/artist.png',
      artistName: 'Priya Sharma',
      description: 'Vibrant sunset over the mountains with beautiful color gradients and peaceful vibes',
    },
    {
      id: 2,
      artworkImage: 'https://picsum.photos/400/300?random=12',
      artistAvatar: '/artist.png',
      artistName: 'Rahul Kumar',
      description: 'Abstract geometric patterns inspired by traditional Indian art forms',
    },
    {
      id: 3,
      artworkImage: 'https://picsum.photos/400/300?random=13',
      artistAvatar: '/artist.png',
      artistName: 'Anita Desai',
      description: 'Watercolor painting depicting monsoon landscapes with ethereal quality',
    },
    {
      id: 4,
      artworkImage: 'https://picsum.photos/400/300?random=14',
      artistAvatar: '/artist.png',
      artistName: 'Vikram Singh',
      description: 'Modern digital art exploring themes of identity and culture',
    },
    {
      id: 5,
      artworkImage: 'https://picsum.photos/400/300?random=15',
      artistAvatar: '/artist.png',
      artistName: 'Meera Patel',
      description: 'Detailed pen and ink illustration of urban architecture and city life',
    },
    {
      id: 6,
      artworkImage: 'https://picsum.photos/400/300?random=16',
      artistAvatar: '/artist.png',
      artistName: 'Arjun Reddy',
      description: 'Mixed media collage combining photography and painting techniques',
    },
    {
      id: 7,
      artworkImage: 'https://picsum.photos/400/300?random=17',
      artistAvatar: '/artist.png',
      artistName: 'Kavya Nair',
      description: 'Portrait series capturing emotions and expressions in vivid colors',
    },
    {
      id: 8,
      artworkImage: 'https://picsum.photos/400/300?random=18',
      artistAvatar: '/artist.png',
      artistName: 'Sanjay Mehta',
      description: 'Minimalist landscape photography with dramatic lighting and composition',
    },
  ];

  const [likedArtworks, setLikedArtworks] = useState<Set<number>>(new Set());
  const [savedArtworks, setSavedArtworks] = useState<Set<number>>(new Set());

  const handleArtworkClick = (id: number) => {
    navigate(`/card/${id}`);
  };

  const handleLike = (id: number) => {
    setLikedArtworks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = (id: number) => {
    console.log('Share artwork:', id);
    // Implement share functionality
  };

  const handleSave = (id: number) => {
    setSavedArtworks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Sort stories: unviewed first, then viewed
  const sortedStories = useMemo(() => {
    return [...stories].sort((a, b) => {
      const aViewed = viewedStories.has(a.id);
      const bViewed = viewedStories.has(b.id);
      if (aViewed === bViewed) return 0;
      return aViewed ? 1 : -1;
    });
  }, [viewedStories]);

  // Random titles for artworks
  const artworkTitles = [
    'Dreamscape',
    'Urban Rhythm',
    'Monsoon Muse',
    'Identity Layers',
    'City Lines',
    'Fusion Forms',
    'Vivid Faces',
    'Silent Horizon',
  ];

  return (
    <Layout onLogout={handleLogout} pageTitle={`Hey ${appUser?.name.split(' ')[0] || 'there'}!`}>
      <div style={styles.container}>
        <div className="stories-section">
          <div className="stories-container">
            {sortedStories.map((story) => (
              <div key={story.id} className="story-item" onClick={() => handleStoryClick(story)}>
                <div className={`story-square ${viewedStories.has(story.id) ? 'viewed' : ''}`}>
                  <img src={story.image} alt={story.name} className="story-thumbnail" />
                  <div className="story-user-icon">
                    <img src={story.userIcon} alt={story.name} className="user-avatar" />
                  </div>
                </div>
                <span className="story-name">{story.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Artwork Cards Grid */}
        <div className="artwork-grid">
          {artworks.map((artwork, idx) => (
            <ArtworkCard
              key={artwork.id}
              id={artwork.id}
              artworkImage={artwork.artworkImage}
              artistAvatar={artwork.artistAvatar}
              artistName={artwork.artistName}
              title={artworkTitles[idx % artworkTitles.length]}
              description={artwork.description}
              onCardClick={handleArtworkClick}
              onLike={handleLike}
              onShare={handleShare}
              onSave={handleSave}
              isLiked={likedArtworks.has(artwork.id)}
              isSaved={savedArtworks.has(artwork.id)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Story Modal */}
      {selectedStory && (
        <div className="story-fullscreen" onClick={handleCloseStory}>
          <div className="story-fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button className="story-close-btn" onClick={handleCloseStory}>
              ✕
            </button>
            <div className="story-image-wrapper" onClick={handleImageClick}>
              <img 
                src={selectedStory.image} 
                alt={selectedStory.name} 
                className="story-fullscreen-image"
              />
              <div className="story-price">{selectedStory.price}</div>
            </div>
            <div className="story-fullscreen-info">
              <img src={selectedStory.userIcon} alt={selectedStory.name} className="story-fullscreen-avatar" />
              <span className="story-fullscreen-name">{selectedStory.name}</span>
            </div>
            <div className="story-fullscreen-actions">
              <div className="story-buttons">
                <button className="story-btn story-btn-primary">
                  View Details
                </button>
                <button className="story-btn story-btn-secondary">
                  Reach Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    padding: '0',
    margin: '0 -0.5rem',
  },
};

export default HomeFeed;
