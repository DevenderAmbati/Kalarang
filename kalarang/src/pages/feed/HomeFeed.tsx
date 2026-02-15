import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ArtworkCard from '../../components/Artwork/ArtworkCard';
import EmptyState from '../../components/State/EmptyState';
import LoadingState from '../../components/State/LoadingState';
import { getPublishedArtworks } from '../../services/artworkService';
import { 
  saveArtworkToFavorites, 
  removeArtworkFromFavorites, 
  isArtworkInFavorites 
} from '../../services/interactionService';
import { Artwork } from '../../types/artwork';
import { toast } from 'react-toastify';
import artAnimation from '../../animations/no content.json';
import africanArtAnimation from '../../animations/African American Art.json';
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
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const fetchedArtworks = await getPublishedArtworks(20);
      setArtworks(fetchedArtworks);

      // Load user's saves if logged in
      if (appUser) {
        const saveChecks = await Promise.all(
          fetchedArtworks.map(artwork => isArtworkInFavorites(appUser.uid, artwork.id))
        );
        const saved = new Set<string>();
        
        fetchedArtworks.forEach((artwork, index) => {
          if (saveChecks[index]) saved.add(artwork.id);
        });

        setSavedArtworks(saved);
      }
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleArtworkClick = (id: number | string) => {
    navigate(`/card/${id}`);
  };

  const handleShare = (id: number | string) => {
    const artwork = artworks.find(a => a.id === id.toString());
    if (artwork && navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Check out "${artwork.title}" by ${artwork.artistName}`,
        url: `${window.location.origin}/card/${id}`,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/card/${id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSave = async (id: number | string) => {
    if (!appUser) {
      toast.error('Please log in to save artworks');
      return;
    }

    const artworkId = id.toString();
    const isSaved = savedArtworks.has(artworkId);

    try {
      if (isSaved) {
        await removeArtworkFromFavorites(appUser.uid, artworkId);
        setSavedArtworks(prev => {
          const newSet = new Set(prev);
          newSet.delete(artworkId);
          return newSet;
        });
        toast.success('Removed from favorites');
      } else {
        await saveArtworkToFavorites(appUser.uid, artworkId);
        setSavedArtworks(prev => new Set(prev).add(artworkId));
        toast.success('Saved to favorites');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update favorites');
    }
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
        {loading ? (
          <LoadingState 
            animation={africanArtAnimation}
            message="Discovering amazing artworks..." 
            fullHeight 
          />
        ) : artworks.length === 0 ? (
          <EmptyState
            animation={artAnimation}
            title="No Artworks Yet"
            description="Follow artists to view their works in your feed and stay updated with their latest creations."
            actionLabel="Discover Artists"
            actionPath="/discover"
          />
        ) : (
          <div className="artwork-grid">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                id={parseInt(artwork.id) || 0}
                artworkImage={artwork.images[0]}
                artistAvatar={artwork.artistAvatar || '/artist.png'}
                artistName={artwork.artistName}
                title={artwork.title}
                description={artwork.description}
                onCardClick={() => handleArtworkClick(artwork.id)}
                onShare={() => handleShare(artwork.id)}
                onSave={() => handleSave(artwork.id)}
                isSaved={savedArtworks.has(artwork.id)}
              />
            ))}
          </div>
        )}
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
