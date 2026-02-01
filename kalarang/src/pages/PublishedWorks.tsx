import React from 'react';
import ArtworkGrid from '../components/ArtworkGrid';
import './PublishedWorks.css';

// Mock published works data
const MOCK_PUBLISHED_WORKS = [
  {
    id: '1',
    title: 'Featured in Art Monthly Magazine',
    artworkImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 45000,
  },
  {
    id: '2',
    title: 'Gallery Exhibition - Abstract Series',
    artworkImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 35000,
  },
  {
    id: '3',
    title: 'Published Book Cover Design',
    artworkImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 28000,
  },
  {
    id: '4',
    title: 'Art Fair Collection - 2025',
    artworkImage: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 52000,
  },
  {
    id: '5',
    title: 'Museum Permanent Collection',
    artworkImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 75000,
  },
  {
    id: '6',
    title: 'International Art Review Feature',
    artworkImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 38000,
  },
  {
    id: '7',
    title: 'Award Winning Landscape Series',
    artworkImage: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 42000,
  },
  {
    id: '8',
    title: 'Limited Edition Print Collection',
    artworkImage: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    artistName: 'Artist Name',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 25000,
  },
];

const PublishedWorks: React.FC = () => {
  const handleArtworkClick = (id: string) => {
    console.log('Published work clicked:', id);
    // Navigate to artwork detail or show modal
  };

  return (
    <div className="published-works-wrapper">
      <div className="published-works-container">
 
        
        <div className="published-works-content">
          <ArtworkGrid 
            artworks={MOCK_PUBLISHED_WORKS} 
            onArtworkClick={handleArtworkClick}
          />
        </div>
      </div>
    </div>
  );
};

export default PublishedWorks;