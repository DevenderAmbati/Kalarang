import React from 'react';
import ArtworkGridCard from './ArtworkGridCard';
import './ArtworkGrid.css';

export interface Artwork {
  id: string;
  title: string;
  artworkImage: string;
  artistName: string;
  artistAvatar: string;
  price: number;
  sold?: boolean;
}

export interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (id: string) => void;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAsSold?: (id: string) => void;
  onSave?: (id: string) => void;
  savedArtworks?: Set<string>;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ 
  artworks, 
  onArtworkClick,
  isOwner = false,
  onEdit,
  onDelete,
  onMarkAsSold,
  onSave,
  savedArtworks
}) => {
  return (
    <div className="artwork-grid">
      {artworks.map((artwork) => (
        <ArtworkGridCard
          key={artwork.id}
          artwork={artwork}
          onArtworkClick={onArtworkClick}
          isOwner={isOwner}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsSold={onMarkAsSold}
          onSave={onSave}
          isSaved={savedArtworks?.has(artwork.id) || false}
        />
      ))}
    </div>
  );
};

export default ArtworkGrid;
