import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { Artwork } from '../components/ArtworkGrid';
import './Discover.css';

// Mock favorite artworks data - these should all start as favorites
const MOCK_FAVORITE_ARTWORKS: Artwork[] = [
  {
    id: '1',
    title: 'Sunset Dreams',
    artworkImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    artistName: 'Priya Sharma',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 15000,
  },
  {
    id: '2',
    title: 'Urban Symphony',
    artworkImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    artistName: 'Rajesh Kumar',
    artistAvatar: 'https://i.pravatar.cc/150?img=2',
    price: 25000,
  },
  {
    id: '3',
    title: 'Nature\'s Canvas',
    artworkImage: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800',
    artistName: 'Ananya Desai',
    artistAvatar: 'https://i.pravatar.cc/150?img=3',
    price: 18000,
  },
  {
    id: '4',
    title: 'Abstract Thoughts',
    artworkImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
    artistName: 'Vikram Singh',
    artistAvatar: 'https://i.pravatar.cc/150?img=4',
    price: 22000,
  },
  {
    id: '5',
    title: 'Ethereal Beauty',
    artworkImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
    artistName: 'Meera Patel',
    artistAvatar: 'https://i.pravatar.cc/150?img=5',
    price: 30000,
  },
  {
    id: '6',
    title: 'Modern Minimalism',
    artworkImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800',
    artistName: 'Arjun Mehta',
    artistAvatar: 'https://i.pravatar.cc/150?img=6',
    price: 20000,
  },
  {
    id: '7',
    title: 'Golden Hour',
    artworkImage: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=800',
    artistName: 'Kavita Reddy',
    artistAvatar: 'https://i.pravatar.cc/150?img=7',
    price: 28000,
  },
  {
    id: '8',
    title: 'Ocean Whispers',
    artworkImage: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    artistName: 'Aditya Joshi',
    artistAvatar: 'https://i.pravatar.cc/150?img=8',
    price: 19500,
  },
];

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
  const [favoriteArtworks, setFavoriteArtworks] = useState<Artwork[]>(MOCK_FAVORITE_ARTWORKS);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleArtworkClick = (id: string) => {
    console.log('Artwork clicked:', id);
    // Navigate to artwork detail page
    // navigate(`/artwork/${id}`);
  };

  const handleRemoveFromFavorites = (id: string) => {
    // Start the removal animation
    setRemovingIds(prev => new Set(prev).add(id));
    
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
    }, 300); // 300ms matches our CSS animation duration
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
          {favoriteArtworks.length > 0 ? (
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
            <div style={styles.emptyState}>
              <span style={styles.emoji}>💝</span>
              <h3 style={styles.emptyTitle}>Your Favorites Are Empty</h3>
              <p style={styles.emptyText}>
                Start exploring and add some artworks to your personal collection!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    backgroundColor: 'rgba(47, 164, 169, 0.05)',
    borderRadius: '12px',
    border: '2px dashed rgba(47, 164, 169, 0.2)',
    marginTop: '2rem',
  },
  emoji: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.75rem',
    fontWeight: 600,
    color: 'var(--color-primary)',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: 'var(--color-text-secondary)',
  },
};

export default Favourites;
