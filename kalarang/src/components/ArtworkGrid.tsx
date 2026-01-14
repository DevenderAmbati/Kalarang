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
}

export interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (id: string) => void;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ artworks, onArtworkClick }) => {
  return (
    <div className="artwork-grid">
      {artworks.map((artwork) => (
        <ArtworkGridCard
          key={artwork.id}
          artwork={artwork}
          onArtworkClick={onArtworkClick}
        />
      ))}
    </div>
  );
};

export default ArtworkGrid;
