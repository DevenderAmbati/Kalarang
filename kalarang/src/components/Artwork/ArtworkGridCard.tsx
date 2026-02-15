import React, { useState, useRef, useEffect } from 'react';
import './ArtworkGridCard.css';
import { Artwork } from './ArtworkGrid';

export interface ArtworkGridCardProps {
  artwork: Artwork;
  onArtworkClick: (id: string) => void;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAsSold?: (id: string) => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

const ArtworkGridCard: React.FC<ArtworkGridCardProps> = ({ 
  artwork, 
  onArtworkClick,
  isOwner = false,
  onEdit,
  onDelete,
  onMarkAsSold,
  onSave,
  isSaved = false
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    onArtworkClick(artwork.id);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
    if (onSave) onSave(artwork.id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) onEdit(artwork.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(artwork.id);
  };

  const handleMarkAsSold = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onMarkAsSold) onMarkAsSold(artwork.id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className={`artwork-grid-card ${showMenu ? 'menu-open' : ''}`} onClick={handleCardClick}>
      <div className="artwork-grid-card-image-container">
        <img src={artwork.artworkImage} alt={artwork.title} className="artwork-grid-card-image" />
        
        <div className="artwork-grid-card-overlay">
          <h3 className="artwork-grid-card-title">{artwork.title}</h3>
        </div>
        
        {artwork.sold && (
          <div className="artwork-sold-badge">
            <span>SOLD</span>
          </div>
        )}
        
        <button
          className={`artwork-grid-card-heart ${saved ? 'liked' : ''}`}
          onClick={handleSaveClick}
          aria-label="Save to favorites"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
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
          <div className="artwork-grid-card-price-container">
            <div className="artwork-grid-card-price">
              {formatPrice(artwork.price)}
            </div>
            {isOwner && (
              <div className="artwork-grid-card-menu-wrapper" ref={menuRef}>
                <button
                  className="artwork-grid-card-menu-button"
                  onClick={handleMenuClick}
                  aria-label="More options"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="artwork-grid-card-dropdown">
                    <button className="dropdown-item" onClick={handleEdit}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit Artwork
                    </button>
                    <button className="dropdown-item" onClick={handleDelete}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete Artwork
                    </button>
                    <button className="dropdown-item" onClick={handleMarkAsSold}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      Mark as Sold
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkGridCard;
