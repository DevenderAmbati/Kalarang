import React, { useState } from 'react';
import './ArtworkGridCard.css';
import { Artwork } from './ArtworkGrid';

export interface ArtworkGridCardProps {
  artwork: Artwork;
  onArtworkClick: (id: string) => void;
}

const ArtworkGridCard: React.FC<ArtworkGridCardProps> = ({ artwork, onArtworkClick }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleCardClick = () => {
    onArtworkClick(artwork.id);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="artwork-grid-card" onClick={handleCardClick}>
      <div className="artwork-grid-card-image-container">
        <img src={artwork.artworkImage} alt={artwork.title} className="artwork-grid-card-image" />
        
        <div className="artwork-grid-card-overlay">
          <h3 className="artwork-grid-card-title">{artwork.title}</h3>
        </div>
        
        <button
          className={`artwork-grid-card-heart ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          aria-label="Like artwork"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
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

export default ArtworkGridCard;
