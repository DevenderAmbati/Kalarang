import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ArtworkDetail, { Artwork as ArtworkDetailType, Artist } from '../components/ArtworkDetail';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { getArtwork, incrementArtworkViews } from '../services/artworkService';
import { 
  likeArtwork, 
  unlikeArtwork, 
  hasLikedArtwork, 
  followArtist, 
  unfollowArtist, 
  isFollowingArtist 
} from '../services/interactionService';
import { toast } from 'react-toastify';

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<ArtworkDetailType | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  useEffect(() => {
    if (id) {
      loadArtwork();
    }
  }, [id, appUser]);

  const loadArtwork = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const fetchedArtwork = await getArtwork(id);
      
      if (!fetchedArtwork) {
        toast.error('Artwork not found');
        navigate('/home');
        return;
      }

      // Increment view count
      await incrementArtworkViews(id);

      // Convert to ArtworkDetailType
      const artworkDetail: ArtworkDetailType = {
        id: parseInt(fetchedArtwork.id) || 0,
        title: fetchedArtwork.title,
        artworkImage: fetchedArtwork.images[0],
        thumbnails: fetchedArtwork.images.slice(1, 5),
        medium: fetchedArtwork.medium,
        size: fetchedArtwork.width && fetchedArtwork.height 
          ? `${fetchedArtwork.width}" × ${fetchedArtwork.height}"`
          : 'Size not specified',
        createdOn: fetchedArtwork.createdDate || fetchedArtwork.createdAt.toLocaleDateString(),
        price: fetchedArtwork.price,
        description: fetchedArtwork.description,
      };

      setArtwork(artworkDetail);

      // Set up artist
      const artistData: Artist = {
        id: fetchedArtwork.artistId,
        name: fetchedArtwork.artistName,
        avatar: fetchedArtwork.artistAvatar || 'https://i.pravatar.cc/150?img=1',
        isFollowing: false,
      };

      // Check if user is following artist
      if (appUser && appUser.uid !== fetchedArtwork.artistId) {
        const following = await isFollowingArtist(appUser.uid, fetchedArtwork.artistId);
        artistData.isFollowing = following;

        // Check if user has liked the artwork
        const liked = await hasLikedArtwork(appUser.uid, id);
        setIsLiked(liked);
      }

      setArtist(artistData);
    } catch (error) {
      console.error('Error loading artwork:', error);
      toast.error('Failed to load artwork');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artworkId: number) => {
    if (!appUser || !id) {
      toast.error('Please log in to like artworks');
      return;
    }

    try {
      if (isLiked) {
        await unlikeArtwork(appUser.uid, id);
        setIsLiked(false);
      } else {
        await likeArtwork(appUser.uid, id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = (artworkId: number) => {
    if (navigator.share && artwork) {
      navigator.share({
        title: artwork.title,
        text: `Check out this artwork: ${artwork.title}`,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReachOut = (artistId: string) => {
    // TODO: Implement messaging system
    toast.info('Messaging feature coming soon!');
  };

  const handleFollow = async (artistId: string) => {
    if (!appUser) {
      toast.error('Please log in to follow artists');
      return;
    }

    if (!artist) return;

    try {
      if (artist.isFollowing) {
        await unfollowArtist(appUser.uid, artistId);
        setArtist({ ...artist, isFollowing: false });
        toast.success('Unfollowed artist');
      } else {
        await followArtist(appUser.uid, artistId);
        setArtist({ ...artist, isFollowing: true });
        toast.success('Following artist');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleThumbnailClick = (imageUrl: string) => {
    console.log('Thumbnail clicked:', imageUrl);
  };

  if (loading || !artwork || !artist) {
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