import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ArtworkDetail, { Artwork, Artist } from '../components/ArtworkDetail';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { appUser } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  useEffect(() => {
    // TODO: Fetch actual artwork data from your backend/Firebase using the id
    // For now, using sample data
    const sampleArtwork: Artwork = {
      id: parseInt(id || '1'),
      title: 'Sunset over the Mountains',
      artworkImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
      thumbnails: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200',
        'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=200',
        'https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=200',
        'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=200',
      ],
      medium: 'Oil on Canvas',
      size: '24" × 36"',
      createdOn: '2023-08-15',
      price: 45000,
      description: 'A breathtaking landscape capturing the golden hour as the sun sets behind majestic mountain peaks. This piece explores the interplay of light and shadow, creating a serene and contemplative atmosphere.',
    };

    const sampleArtist: Artist = {
      id: 'artist_123',
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isFollowing: false,
    };

    setArtwork(sampleArtwork);
    setArtist(sampleArtist);
  }, [id]);

  const handleLike = (artworkId: number) => {
    setIsLiked(!isLiked);
    // TODO: Implement like logic with your backend
    console.log('Liked artwork:', artworkId);
  };

  const handleShare = (artworkId: number) => {
    // TODO: Implement share logic
    console.log('Share artwork:', artworkId);
    if (navigator.share) {
      navigator.share({
        title: artwork?.title,
        text: `Check out this artwork: ${artwork?.title}`,
        url: window.location.href,
      });
    }
  };

  const handleReachOut = (artistId: string) => {
    // TODO: Implement reach out logic (e.g., open chat, send message)
    console.log('Reach out to artist:', artistId);
  };

  const handleFollow = (artistId: string) => {
    if (artist) {
      setArtist({
        ...artist,
        isFollowing: !artist.isFollowing,
      });
      // TODO: Implement follow logic with your backend
      console.log('Follow artist:', artistId);
    }
  };

  const handleThumbnailClick = (imageUrl: string) => {
    console.log('Thumbnail clicked:', imageUrl);
  };

  if (!artwork || !artist) {
    return (
      <Layout onLogout={handleLogout} pageTitle="Loading...">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading artwork details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout} pageTitle={artwork.title}>
      <ArtworkDetail
        artwork={artwork}
        artist={artist}
        currentUserAvatar={appUser?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(appUser.name || appUser.email)}` : undefined}
        onLike={handleLike}
        onShare={handleShare}
        onReachOut={handleReachOut}
        onFollow={handleFollow}
        onThumbnailClick={handleThumbnailClick}
        isLiked={isLiked}
      />
    </Layout>
  );
};

export default CardDetail;