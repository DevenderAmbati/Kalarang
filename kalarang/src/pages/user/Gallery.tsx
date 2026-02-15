import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getArtistArtworks } from '../../services/artworkService';
import { Artwork } from '../../types/artwork';
import GalleryTab, { GalleryImage } from '../../components/Profile/GalleryTab';
import EmptyState from '../../components/State/EmptyState';
import LoadingState from '../../components/State/LoadingState';
import noContentAnimation from '../../animations/no content.json';
import lineArt1Animation from '../../animations/Line art (1).json';

const Gallery: React.FC = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, [appUser]);

  const loadGallery = async () => {
    if (!appUser) return;

    try {
      setLoading(true);
      const fetchedArtworks = await getArtistArtworks(appUser.uid, false); // All artworks (published and unpublished)
      setArtworks(fetchedArtworks);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (artworkId: string) => {
    const artwork = artworks.find(a => a.id === artworkId);
    if (artwork && !artwork.published) {
      // If unpublished, navigate to edit page
      navigate(`/post?edit=${artworkId}`);
    } else {
      // If published, navigate to detail page
      navigate(`/artwork/${artworkId}`);
    }
  };

  if (loading) {
    return <LoadingState animation={lineArt1Animation} message="Loading your gallery..." fullHeight />;
  }

  // Convert artworks to gallery images (only first image of each artwork)
  const galleryImages: GalleryImage[] = artworks.map(artwork => ({
    id: artwork.id,
    src: artwork.images[0],
    alt: artwork.title,
    published: artwork.published,
  }));

  if (galleryImages.length === 0) {
    return (
      <EmptyState
        animation={noContentAnimation}
        title="Your Gallery Awaits"
        description="Your creative space is ready! Upload your artwork to build your personal gallery and showcase your talent."
        actionLabel="Upload Your First Piece"
        actionPath="/post"
      />
    );
  }


  return <GalleryTab images={galleryImages} onImageClick={handleImageClick} />;
};

export default Gallery;