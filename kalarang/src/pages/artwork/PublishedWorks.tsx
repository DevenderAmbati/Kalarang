import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getArtistArtworks } from '../../services/artworkService';
import { saveArtworkToFavorites, removeArtworkFromFavorites, isArtworkInFavorites } from '../../services/interactionService';
import { Artwork } from '../../types/artwork';
import ArtworkGrid from '../../components/Artwork/ArtworkGrid';
import EmptyState from '../../components/State/EmptyState';
import LoadingState from '../../components/State/LoadingState';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import noContentAnimation from '../../animations/no content.json';
import lineArt2Animation from '../../animations/Line art (2).json';
import './PublishedWorks.css';

const PublishedWorks: React.FC = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'sold';
    artworkId: string;
  }>({
    isOpen: false,
    type: 'delete',
    artworkId: '',
  });

  useEffect(() => {
    loadPublishedWorks();
  }, [appUser]);

  const loadPublishedWorks = async () => {
    if (!appUser) return;

    try {
      setLoading(true);
      const fetchedArtworks = await getArtistArtworks(appUser.uid, true); // Only published
      setArtworks(fetchedArtworks);

      // Load saved artworks
      const savedSet = new Set<string>();
      const saveChecks = await Promise.all(
        fetchedArtworks.map(artwork => isArtworkInFavorites(appUser.uid, artwork.id))
      );
      
      fetchedArtworks.forEach((artwork, index) => {
        if (saveChecks[index]) {
          savedSet.add(artwork.id);
        }
      });

      setSavedArtworks(savedSet);
    } catch (error) {
      console.error('Error loading published works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtworkClick = (id: string) => {
    navigate(`/card/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/post?edit=${id}`);
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      artworkId: id,
    });
  };

  const handleMarkAsSold = (id: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'sold',
      artworkId: id,
    });
  };

  const handleSave = async (id: string) => {
    if (!appUser) {
      toast.error('Please log in to save artworks');
      return;
    }

    const isSaved = savedArtworks.has(id);

    try {
      if (isSaved) {
        await removeArtworkFromFavorites(appUser.uid, id);
        setSavedArtworks(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast.success('Removed from favorites');
      } else {
        await saveArtworkToFavorites(appUser.uid, id);
        setSavedArtworks(prev => new Set(prev).add(id));
        toast.success('Saved to favorites');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleConfirmAction = async () => {
    const { artworkId, type } = confirmModal;

    try {
      if (type === 'delete') {
        const { deleteArtwork } = await import('../../services/artworkService');
        await deleteArtwork(artworkId);
      } else if (type === 'sold') {
        const { updateArtwork } = await import('../../services/artworkService');
        await updateArtwork(artworkId, { sold: true });
      }
      // Reload the artworks after action
      loadPublishedWorks();
    } catch (error) {
      console.error(`Error ${type === 'delete' ? 'deleting' : 'marking as sold'} artwork:`, error);
      alert(`Failed to ${type === 'delete' ? 'delete' : 'mark as sold'} artwork. Please try again.`);
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      type: 'delete',
      artworkId: '',
    });
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
                sold: artwork.sold,
              }))}
              onArtworkClick={handleArtworkClick}
              isOwner={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkAsSold={handleMarkAsSold}
              onSave={handleSave}
              savedArtworks={savedArtworks}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        type={confirmModal.type === 'delete' ? 'danger' : 'warning'}
        title={confirmModal.type === 'delete' ? 'Delete Artwork?' : 'Mark as Sold?'}
        message={
          confirmModal.type === 'delete'
            ? 'This will permanently delete this artwork and all its images from storage. This action cannot be undone.'
            : 'Marking this artwork as sold cannot be undone. The artwork will be labeled as sold everywhere it appears.'
        }
        confirmText={confirmModal.type === 'delete' ? 'Delete' : 'Mark as Sold'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default PublishedWorks;