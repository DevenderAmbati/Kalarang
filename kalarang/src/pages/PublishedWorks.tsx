import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getArtistArtworks } from '../services/artworkService';
import { Artwork } from '../types/artwork';
import ArtworkGrid from '../components/ArtworkGrid';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useNavigate } from 'react-router-dom';
import noContentAnimation from '../animations/no content.json';
import lineArt2Animation from '../animations/Line art (2).json';
import './PublishedWorks.css';

const PublishedWorks: React.FC = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublishedWorks();
  }, [appUser]);

  const loadPublishedWorks = async () => {
    if (!appUser) return;

    try {
      setLoading(true);
      const fetchedArtworks = await getArtistArtworks(appUser.uid, true); // Only published
      setArtworks(fetchedArtworks);
    } catch (error) {
      console.error('Error loading published works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtworkClick = (id: string) => {
    navigate(`/card/${id}`);
  };

  if (loading) {
    return (
      <div className="published-works-wrapper">
        <div className="published-works-container">
          <LoadingState 
            animation={lineArt2Animation}
            message="Loading your published works..." 
            fullHeight 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="published-works-wrapper">
      <div className="published-works-container">
        <div className="published-works-content">
          {artworks.length === 0 ? (
            <EmptyState
              animation={noContentAnimation}
              title="Ready to Publish?"
              description="Your portfolio is waiting for your masterpieces! Upload artwork from the Gallery tab and publish it to share with the world."
              actionLabel="Create Artwork"
              actionPath="/post"
            />
          ) : (
            <ArtworkGrid 
              artworks={artworks.map(artwork => ({
                id: artwork.id,
                title: artwork.title,
                artworkImage: artwork.images[0],
                artistName: artwork.artistName,
                artistAvatar: artwork.artistAvatar || '',
                price: artwork.price,
              }))}
              onArtworkClick={handleArtworkClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishedWorks;