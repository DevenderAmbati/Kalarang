import React from 'react';
import './ArtworkCard.css';

export interface ArtworkCardProps {
  id: number;
  artworkImage: string;
  artistAvatar: string;
  artistName: string;
  title?: string;
  description: string;
  onCardClick?: (id: number) => void;
  onShare?: (id: number) => void;
  onSave?: (id: number) => void;
  isSaved?: boolean;
  sold?: boolean;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({
  id,
  artworkImage,
  artistAvatar,
  artistName,
  title,
  description,
  onCardClick,
  onShare,
  onSave,
  isSaved = false,
  sold = false,
}) => {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(id);
    }
  };

  const handleIconClick = (
    e: React.MouseEvent,
    action?: (id: number) => void
  ) => {
    e.stopPropagation();
    if (action) {
      action(id);
    }
  };

  return (
    <div className="artwork-card" onClick={handleCardClick}>
      <div className="artwork-card-header">
        <div className="artist-avatar">
          <img src={artistAvatar} alt={artistName} />
        </div>
        <div className="artist-name">{artistName}</div>
      </div>

      <div className="artwork-image-container">
        <img src={artworkImage} alt={description} className="artwork-image" />
      </div>

      <div className="artwork-description">
        {title && <div className="artwork-title">{title}</div>}
        <p>{description}</p>
      </div>

      <div className="artwork-actions">
        <button
          className={`action-icon ${isSaved ? 'active' : ''}`}
          onClick={(e) => handleIconClick(e, onSave)}
          aria-label="Save to favorites"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <button
          className="action-icon"
          onClick={(e) => handleIconClick(e, onShare)}
          aria-label="Share"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ArtworkCard;
