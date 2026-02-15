import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Artwork } from '../../components/Artwork/ArtworkGrid';
import EmptyState from '../../components/State/EmptyState';
import LoadingState from '../../components/State/LoadingState';
import { getUserFavoriteArtworkIds, removeArtworkFromFavorites } from '../../services/interactionService';
import { getArtwork } from '../../services/artworkService';
import girlAnimation from '../../animations/girl bangs computer.json';
import noContentAnimation from '../../animations/no content.json';
import { toast } from 'react-toastify';
import '../feed/Discover.css';

// Custom Artwork Card Component for Favorites with filled hearts by default
interface FavoriteArtworkCardProps {
  artwork: Artwork;
  onArtworkClick: (id: string) => void;
  onRemoveFromFavorites: (id: string) => void;
  isRemoving?: boolean;
}

const FavoriteArtworkCard: React.FC<FavoriteArtworkCardProps> = ({ 
  artwork, 
  onArtworkClick, 
  onRemoveFromFavorites,
  isRemoving = false
}) => {
  const handleCardClick = () => {
    if (!isRemoving) {
      onArtworkClick(artwork.id);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRemoving) {
      onRemoveFromFavorites(artwork.id);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div 
      className={`artwork-grid-card ${isRemoving ? 'removing' : ''}`}
      onClick={handleCardClick}
      style={isRemoving ? {
        transition: 'all 0.3s ease-out',
        transform: 'scale(0.9)',
        opacity: 0,
      } : {}}
    >
      <div className="artwork-grid-card-image-container">
        <img src={artwork.artworkImage} alt={artwork.title} className="artwork-grid-card-image" />
        
        <div className="artwork-grid-card-overlay">
          <h3 className="artwork-grid-card-title">{artwork.title}</h3>
        </div>
        
        <button
          className={`artwork-grid-card-heart liked ${isRemoving ? 'removing' : ''}`}
          onClick={handleHeartClick}
          aria-label="Remove from favorites"
          style={isRemoving ? {
            transition: 'all 0.2s ease-out',
            transform: 'scale(0.8)',
            opacity: 0.5,
          } : {}}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="artwork-grid-card-content">
        <div className="artwork-grid-card-artist">
          <div className="artwork-grid-card-avatar">
            <img src={artwork.artistAvatar} alt={artwork.artistName} />
          </div>
          <span className="artwork-grid-card-artist-name">{artwork.artistName}</span>
          <div className="artwork-grid-card-price">
            {formatPrice(artwork.price)}
          </div>
        </div>
      </div>
    </div>
  );
};

const Favourites: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [favoriteArtworks, setFavoriteArtworks] = useState<Artwork[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    // Also reload when user navigates to this page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFavorites();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [appUser]);

  const loadFavorites = async () => {
    if (!appUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const favoriteIds = await getUserFavoriteArtworkIds(appUser.uid);
      
      if (favoriteIds.length === 0) {
        setFavoriteArtworks([]);
        return;
      }

      // Fetch all favorite artworks
      const artworksPromises = favoriteIds.map(id => getArtwork(id));
      const artworks = await Promise.all(artworksPromises);
      
      // Filter out any null results and convert to Artwork type
      const validArtworks: Artwork[] = artworks
        .filter(artwork => artwork !== null)
        .map(artwork => ({
          id: artwork!.id,
          title: artwork!.title,
          artworkImage: artwork!.images[0],
          artistName: artwork!.artistName,
          artistAvatar: artwork!.artistAvatar || '/artist.png',
          price: artwork!.price,
        }));

      setFavoriteArtworks(validArtworks);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavoriteArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleArtworkClick = (id: string) => {
    console.log('Artwork clicked:', id);
    // Navigate to artwork detail page
    navigate(`/card/${id}`);
  };

  const handleRemoveFromFavorites = async (id: string) => {
    if (!appUser) return;
    
    // Start the removal animation
    setRemovingIds(prev => new Set(prev).add(id));
    
    try {
      // Remove from database
      await removeArtworkFromFavorites(appUser.uid, id);
      
      // After animation duration, actually remove from state
      setTimeout(() => {
        setFavoriteArtworks(prevArtworks => 
          prevArtworks.filter(artwork => artwork.id !== id)
        );
        setRemovingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast.success('Removed from favorites');
      }, 300); // 300ms matches our CSS animation duration
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
      // Reset animation state on error
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  return (
    <Layout onLogout={handleLogout} pageTitle="Favourites">
      <style>{`
        @media (min-width: 1025px) {
          .favourites-header {
            margin-bottom: 10px !important;
          }
          .favourites-content {
            margin-top: -10px;
          }
        }
      `}</style>
      <div className="discover-container">
        <div className="discover-header favourites-header">
          <p className="discover-description">
            Your personally curated art collection.
          </p>
        </div>

        {/* Artwork Grid */}
        <div className="discover-content favourites-content">
          {loading ? (
            <LoadingState 
              animation={girlAnimation}
              message="Loading your favorites..." 
              fullHeight 
            />
          ) : favoriteArtworks.length > 0 ? (
            <div className="artwork-grid">
              {favoriteArtworks.map((artwork) => (
                <FavoriteArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onArtworkClick={handleArtworkClick}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                  isRemoving={removingIds.has(artwork.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              animation={noContentAnimation}
              title="Your Favorites Collection Awaits"
              description="Discover amazing artworks and save your favorites here. Start exploring and build your personal art collection!"
              actionLabel="Discover Artworks"
              actionPath="/discover"
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Favourites;
