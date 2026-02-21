import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ArtworkGrid from '../../components/Artwork/ArtworkGrid';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ArtworkCard from '../../components/Artwork/ArtworkCard';
import EmptyState from '../../components/State/EmptyState';
import LoadingState from '../../components/State/LoadingState';
import { useFavorites } from '../../hooks/useCachedData';
import { 
  saveArtworkToFavorites, 
  removeArtworkFromFavorites
} from '../../services/interactionService';
import { Artwork } from '../../types/artwork';
import { getPublishedArtworksPaginated } from '../../services/artworkService';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { toast } from 'react-toastify';
import artAnimation from '../../animations/no content.json';
import africanArtAnimation from '../../animations/African American Art.json';
import { cache, cacheKeys } from '../../utils/cache';
import { getActiveStories, Story as StoryType, groupStoriesByUser, GroupedStory, getViewedStories, markStoriesAsViewed, deleteStory } from '../../services/storyService';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import './homeFeed.css';

interface Story {
  id: string;
  image: string;
  name: string;
  userIcon: string;
  price: string;
  artworkId: string;
  artworkTitle: string;
  artistId: string;
}

const HomeFeed: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser } = useAuth();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserStories, setCurrentUserStories] = useState<Story[]>([]);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [viewedUsers, setViewedUsers] = useState<Set<string>>(new Set());
  const [currentSessionViewed, setCurrentSessionViewed] = useState<Set<string>>(new Set());
  const [groupedStories, setGroupedStories] = useState<GroupedStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    storyId: string;
  }>({
    isOpen: false,
    storyId: '',
  });

  // Infinite scroll state
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Use cached data hooks
  const { data: favoriteIds, updateCache: updateFavoritesCache, refetch: refetchFavorites } = useFavorites(appUser?.uid);

  // Listen for favorites changes from other components
  useEffect(() => {
    const handleFavoritesChanged = ((e: CustomEvent) => {
      if (e.detail.userId === appUser?.uid) {
        console.log('[HomeFeed] Favorites changed in another component, refetching...');
        refetchFavorites();
      }
    }) as EventListener;
    
    window.addEventListener('favorites-changed', handleFavoritesChanged);
    return () => window.removeEventListener('favorites-changed', handleFavoritesChanged);
  }, [appUser?.uid, refetchFavorites]);

  // Ensure favorites are loaded
  useEffect(() => {
    if (appUser?.uid && !favoriteIds) {
      console.log('[HomeFeed] Fetching favorites on mount');
      refetchFavorites();
    }
  }, [appUser?.uid, favoriteIds, refetchFavorites]);

  // Initial data fetch with cache
  useEffect(() => {
    const fetchInitialArtworks = async () => {
      // Try to get from cache first
      const cached = cache.get<{
        artworks: Artwork[];
        hasMore: boolean;
      }>(cacheKeys.homeFeedPaginated());

      if (cached.exists && cached.data) {
        // Load from cache immediately
        console.log('[Cache] Loading homefeed data from cache');
        setArtworks(cached.data.artworks);
        setHasMore(cached.data.hasMore);
        setLoading(false);

        // If cache is stale, fetch fresh data in background
        if (cached.isStale) {
          console.log('[Cache] Cache is stale, refreshing in background');
          try {
            const result = await getPublishedArtworksPaginated(20);
            setArtworks(result.artworks);
            setLastVisible(result.lastVisible);
            setHasMore(result.hasMore);
            
            // Update cache
            cache.set(
              cacheKeys.homeFeedPaginated(),
              { artworks: result.artworks, hasMore: result.hasMore },
              2 * 60 * 1000, // 2 minutes stale time
              5 * 60 * 1000  // 5 minutes cache time
            );
          } catch (error) {
            console.error('Error refreshing artworks:', error);
          }
        }
        return;
      }

      // No cache, fetch fresh data
      setLoading(true);
      try {
        console.log('[API] Fetching initial homefeed data');
        const result = await getPublishedArtworksPaginated(20);
        setArtworks(result.artworks);
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        
        // Store in cache
        cache.set(
          cacheKeys.homeFeedPaginated(),
          { artworks: result.artworks, hasMore: result.hasMore },
          2 * 60 * 1000, // 2 minutes stale time
          5 * 60 * 1000  // 5 minutes cache time
        );
      } catch (error) {
        console.error('Error fetching artworks:', error);
        toast.error('Failed to load artworks');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialArtworks();
  }, []);

  // Load more artworks
  const loadMoreArtworks = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisible) return;

    setLoadingMore(true);
    try {
      console.log('[API] Loading more homefeed artworks');
      const result = await getPublishedArtworksPaginated(20, lastVisible);
      const updatedArtworks = [...artworks, ...result.artworks];
      setArtworks(updatedArtworks);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
      // Update cache with accumulated artworks
      cache.set(
        cacheKeys.homeFeedPaginated(),
        { artworks: updatedArtworks, hasMore: result.hasMore },
        2 * 60 * 1000, // 2 minutes stale time
        5 * 60 * 1000  // 5 minutes cache time
      );
    } catch (error) {
      console.error('Error loading more artworks:', error);
      toast.error('Failed to load more artworks');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisible, artworks]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;

      // Get the main content container
      const mainContent = document.querySelector('.layout-main-content');
      if (!mainContent) return;

      const { scrollTop, scrollHeight, clientHeight } = mainContent;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when user scrolls to 80% of content
      if (scrollPercentage > 0.8) {
        loadMoreArtworks();
      }
    };

    const mainContent = document.querySelector('.layout-main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loadingMore, loadMoreArtworks]);

  // Auto-advance timer for stories (5 seconds per story)
  useEffect(() => {
    if (!selectedStory || isPaused || selectedStory.id === 'default-story') return;

    const timer = setTimeout(() => {
      handleNextStory();
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [selectedStory, currentStoryIndex, isPaused]);

  // Fetch stories - refetch when component mounts or becomes visible
  const fetchStories = async (forceRefresh = false) => {
    // Try to get from cache first (unless forced refresh)
    if (!forceRefresh) {
      const cached = cache.get<GroupedStory[]>(cacheKeys.stories());
      
      if (cached.exists && cached.data) {
        console.log('[Cache] Loading stories from cache');
        setGroupedStories(cached.data);
        setLoadingStories(false);
        
        // If cache is stale, fetch fresh data in background
        if (cached.isStale) {
          console.log('[Cache] Stories cache is stale, refreshing in background');
          try {
            const activeStories = await getActiveStories();
            const grouped = groupStoriesByUser(activeStories, appUser?.uid);
            setGroupedStories(grouped);
            
            // Update cache
            cache.set(
              cacheKeys.stories(),
              grouped,
              1 * 60 * 1000, // 1 minute stale time (stories should be fresh)
              3 * 60 * 1000  // 3 minutes cache time
            );
          } catch (error) {
            console.error('Error refreshing stories:', error);
          }
        }
        return;
      }
    }
    
    // No cache or forced refresh, fetch fresh data
    setLoadingStories(true);
    try {
      console.log('[API] Fetching fresh stories data');
      const activeStories = await getActiveStories();
      
      // Group stories by user (Instagram-style) with current user first
      const grouped = groupStoriesByUser(activeStories, appUser?.uid);
      setGroupedStories(grouped);
      
      // Store in cache
      cache.set(
        cacheKeys.stories(),
        grouped,
        1 * 60 * 1000, // 1 minute stale time (stories should be fresh)
        3 * 60 * 1000  // 3 minutes cache time
      );
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  // Load viewed stories from database on mount
  useEffect(() => {
    const loadViewedStories = async () => {
      if (appUser?.uid) {
        const viewedIds = await getViewedStories(appUser.uid);
        setViewedStories(new Set(viewedIds));
      }
    };
    
    loadViewedStories();
    fetchStories();
  }, [appUser?.uid]);

  // Refetch stories when coming from story creation
  useEffect(() => {
    const state = location.state as { storyCreated?: boolean } | null;
    if (state?.storyCreated) {
      fetchStories(true); // Force refresh when story is created
      // Clear the state to prevent refetching on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Refetch stories when the page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStories(true); // Force refresh on visibility change
      }
    };

    const handleFocus = () => {
      fetchStories(true); // Force refresh on focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [appUser?.uid]);

  // Default story to show when there are no stories
  const defaultStory: Story = {
    id: 'default-story',
    image: '/logo.jpeg',
    name: 'Kalarang',
    userIcon: '/logo.jpeg',
    price: '',
    artworkId: '',
    artworkTitle: 'Welcome to Stories',
    artistId: 'system',
  };

  // Convert favorite IDs array to Set for quick lookup
  const savedArtworks = useMemo(() => {
    return new Set(favoriteIds || []);
  }, [favoriteIds]);

  // Sort grouped stories Instagram-style: unviewed first, viewed last, current user always first
  const sortedGroupedStories = useMemo(() => {
    if (groupedStories.length === 0) return [];

    // Check if user has any unviewed stories
    const hasUnviewedStories = (group: GroupedStory) => {
      return group.stories.some(story => !viewedStories.has(story.id));
    };

    // Separate current user's stories and others
    const currentUserStories = groupedStories.filter(g => g.artistId === appUser?.uid);
    const otherStories = groupedStories.filter(g => g.artistId !== appUser?.uid);

    // Sort others: unviewed first, then viewed
    const sortedOthers = [...otherStories].sort((a, b) => {
      const aHasUnviewed = hasUnviewedStories(a);
      const bHasUnviewed = hasUnviewedStories(b);
      
      if (aHasUnviewed && !bHasUnviewed) return -1;
      if (!aHasUnviewed && bHasUnviewed) return 1;
      return 0;
    });

    // Current user first, then sorted others
    return [...currentUserStories, ...sortedOthers];
  }, [groupedStories, viewedStories, appUser?.uid]);

  const handleStoryClick = (artistId: string, userStories: Story[]) => {
    setCurrentUserStories(userStories);
    
    // Find first unviewed story, or start from beginning if all viewed
    const firstUnviewedIndex = userStories.findIndex(story => !viewedStories.has(story.id));
    const startIndex = firstUnviewedIndex !== -1 ? firstUnviewedIndex : 0;
    
    setCurrentStoryIndex(startIndex);
    setSelectedStory(userStories[startIndex]);
    setCurrentSessionViewed(new Set([userStories[startIndex].id]));
  };

  const handleCloseStory = async () => {
    // Mark user as viewed if all their stories were seen
    if (selectedStory) {
      setViewedUsers(prev => new Set(prev).add(selectedStory.artistId));
    }
    
    setSelectedStory(null);
    setCurrentUserStories([]);
    setCurrentStoryIndex(0);
    
    // Mark all stories viewed in this session as viewed
    setViewedStories(prev => {
      const newSet = new Set(prev);
      currentSessionViewed.forEach(id => newSet.add(id));
      return newSet;
    });
    
    // Save to database
    if (appUser?.uid && currentSessionViewed.size > 0) {
      await markStoriesAsViewed(appUser.uid, Array.from(currentSessionViewed));
      // Invalidate stories cache after viewing
      cache.invalidate(cacheKeys.stories());
    }
    
    setCurrentSessionViewed(new Set());
  };

  const handleDeleteStory = () => {
    if (!selectedStory || !appUser?.uid || selectedStory.artistId !== appUser.uid) {
      toast.error('You can only delete your own stories');
      return;
    }

    setIsPaused(true);
    setConfirmModal({
      isOpen: true,
      storyId: selectedStory.id,
    });
  };

  const handleCloseModal = () => {
    setIsPaused(false);
    setConfirmModal({
      isOpen: false,
      storyId: '',
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.storyId || !selectedStory) return;

    try {
      // Delete from Firestore
      await deleteStory(confirmModal.storyId);
      toast.success('Story deleted successfully');
      
      // Invalidate stories cache
      cache.invalidate(cacheKeys.stories());
      
      // Remove from current user stories
      const updatedStories = currentUserStories.filter(s => s.id !== confirmModal.storyId);
      
      if (updatedStories.length === 0) {
        // No more stories, close modal and refresh
        await handleCloseStory();
        await fetchStories(true); // Force refresh
      } else {
        // Move to next story or previous
        setCurrentUserStories(updatedStories);
        const newIndex = currentStoryIndex >= updatedStories.length 
          ? updatedStories.length - 1 
          : currentStoryIndex;
        setCurrentStoryIndex(newIndex);
        setSelectedStory(updatedStories[newIndex]);
      }
      
      // Refresh stories list with force refresh
      await fetchStories(true);
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  const handlePreviousStory = () => {
    if (!selectedStory || currentUserStories.length === 0) return;
    
    if (currentStoryIndex > 0) {
      // Go to previous story of same user
      const newIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(newIndex);
      setSelectedStory(currentUserStories[newIndex]);
      setCurrentSessionViewed(prev => new Set(prev).add(currentUserStories[newIndex].id));
    } else {
      // Go to previous user's last story
      const currentUserIndex = groupedStories.findIndex(g => g.artistId === selectedStory.artistId);
      if (currentUserIndex > 0) {
        const prevGroup = groupedStories[currentUserIndex - 1];
        const prevUserStories = prevGroup.stories.map(s => ({
          id: s.id,
          image: s.artworkImage,
          name: s.userName,
          userIcon: s.userAvatar,
          price: `₹${s.price.toLocaleString('en-IN')}`,
          artworkId: s.artworkId,
          artworkTitle: s.artworkTitle,
          artistId: s.artistId,
        }));
        setCurrentUserStories(prevUserStories);
        const lastIndex = prevUserStories.length - 1;
        setCurrentStoryIndex(lastIndex);
        setSelectedStory(prevUserStories[lastIndex]);
        setCurrentSessionViewed(prev => new Set(prev).add(prevUserStories[lastIndex].id));
      }
    }
  };

  const handleNextStory = () => {
    if (!selectedStory || currentUserStories.length === 0) return;
    
    if (currentStoryIndex < currentUserStories.length - 1) {
      // Go to next story of same user
      const newIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(newIndex);
      setSelectedStory(currentUserStories[newIndex]);
      setCurrentSessionViewed(prev => new Set(prev).add(currentUserStories[newIndex].id));
    } else {
      // Go to next user's first story
      const currentUserIndex = groupedStories.findIndex(g => g.artistId === selectedStory.artistId);
      if (currentUserIndex < groupedStories.length - 1) {
        const nextGroup = groupedStories[currentUserIndex + 1];
        const nextUserStories = nextGroup.stories.map(s => ({
          id: s.id,
          image: s.artworkImage,
          name: s.userName,
          userIcon: s.userAvatar,
          price: `\u20b9${s.price.toLocaleString('en-IN')}`,
          artworkId: s.artworkId,
          artworkTitle: s.artworkTitle,
          artistId: s.artistId,
        }));
        setCurrentUserStories(nextUserStories);
        setCurrentStoryIndex(0);
        setSelectedStory(nextUserStories[0]);
        setCurrentSessionViewed(prev => new Set(prev).add(nextUserStories[0].id));
      } else {
        // Last story, close
        handleCloseStory();
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Pause auto-advance briefly when user taps
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 300);
    
    // Left third of the image
    if (clickX < width / 3) {
      handlePreviousStory();
    }
    // Right third of the image
    else if (clickX > (width * 2) / 3) {
      handleNextStory();
    }
  };

  const handleArtworkClick = (id: number | string) => {
    sessionStorage.setItem('artworkSourceRoute', '/home');
    navigate(`/card/${id}`);
  };

  const handleShare = (id: number | string) => {
    const artwork = artworks?.find(a => a.id === id.toString());
    if (artwork && navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Check out "${artwork.title}" by ${artwork.artistName}`,
        url: `${window.location.origin}/card/${id}`,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/card/${id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSave = async (id: number | string) => {
    if (!appUser) {
      toast.error('Please log in to save artworks');
      return;
    }

    const artworkId = id.toString();
    const isSaved = savedArtworks.has(artworkId);

    // Optimistic update - update UI immediately
    const previousFavorites = favoriteIds || [];
    updateFavoritesCache((oldFavorites) => {
      const favorites = oldFavorites || [];
      if (isSaved) {
        return favorites.filter(id => id !== artworkId);
      } else {
        return [...favorites, artworkId];
      }
    });

    try {
      if (isSaved) {
        await removeArtworkFromFavorites(appUser.uid, artworkId);
        toast.success('Removed from favorites');
      } else {
        await saveArtworkToFavorites(appUser.uid, artworkId);
        toast.success('Saved to your favourites');
      }
      // Invalidate favorite artworks cache
      cache.invalidate(cacheKeys.favoriteArtworks(appUser.uid));
      cache.invalidate(cacheKeys.favorites(appUser.uid));
      
      // Broadcast change to other components
      window.dispatchEvent(new CustomEvent('favorites-changed', { detail: { userId: appUser.uid } }));
    } catch (error) {
      console.error('Error toggling save:', error);
      // Rollback optimistic update on error
      updateFavoritesCache(() => previousFavorites);
      toast.error('Failed to update favorites');
    }
  };

  // Random titles for artworks
  const artworkTitles = [
    'Dreamscape',
    'Urban Rhythm',
    'Monsoon Muse',
    'Identity Layers',
    'City Lines',
    'Fusion Forms',
    'Vivid Faces',
    'Silent Horizon',
  ];

  return (
    <>
      <div style={styles.container}>
        {/* Stories Section */}
        {!loadingStories && (
          <div className="stories-section">
            <div className="stories-container">
              {groupedStories.length === 0 ? (
                <div className="story-item" onClick={() => {
                  const defaultUserStories: Story[] = [{
                    id: 'default-story',
                    image: '/logo.jpeg',
                    name: 'Kalarang',
                    userIcon: '/logo.jpeg',
                    price: '',
                    artworkId: '',
                    artworkTitle: 'Welcome to Stories',
                    artistId: 'system',
                  }];
                  handleStoryClick('system', defaultUserStories);
                }}>
                  <div className="story-square default-story">
                    <img src="/logo.jpeg" alt="Kalarang" className="story-thumbnail" />
                    <div className="story-user-icon">
                      <img src="/logo.jpeg" alt="Kalarang" className="user-avatar" />
                    </div>
                  </div>
                  <span className="story-name">Kalarang</span>
                </div>
              ) : (
                sortedGroupedStories.map((group) => {
                  const isOwnStory = group.artistId === appUser?.uid;
                  // Check if user has ANY unviewed stories
                  const hasUnviewed = group.stories.some(story => !viewedStories.has(story.id));
                  
                  // Find first unviewed story for thumbnail, or use first story if all viewed
                  const firstUnviewedStory = group.stories.find(s => !viewedStories.has(s.id)) || group.stories[0];
                  
                  const userStories: Story[] = group.stories.map(s => ({
                    id: s.id,
                    image: s.artworkImage,
                    name: s.userName,
                    userIcon: s.userAvatar,
                    price: `\u20b9${s.price.toLocaleString('en-IN')}`,
                    artworkId: s.artworkId,
                    artworkTitle: s.artworkTitle,
                    artistId: s.artistId,
                  }));
                  
                  return (
                    <div key={group.artistId} className="story-item" onClick={() => handleStoryClick(group.artistId, userStories)}>
                      <div className={`story-square ${!hasUnviewed ? 'viewed' : ''} ${isOwnStory ? 'own-story' : ''}`}>
                        <img src={firstUnviewedStory.artworkImage} alt={group.userName} className="story-thumbnail" />
                        <div className="story-user-icon">
                          <img src={group.userAvatar} alt={group.userName} className="user-avatar" />
                        </div>
                      </div>
                      <span className="story-name">{isOwnStory ? 'Your Story' : group.userName}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Artwork Cards Grid */}
        {loading ? (
          <LoadingState 
            animation={africanArtAnimation}
            message="Discovering amazing artworks..." 
            fullHeight 
          />
        ) : (!artworks || artworks.length === 0) ? (
          <EmptyState
            animation={artAnimation}
            title="No Artworks Yet"
            description="Follow artists to view their works in your feed and stay updated with their latest creations."
            actionLabel="Discover Artists"
            actionPath="/discover"
          />
        ) : (
          <>
            {artworks.length < 20 ? (
              // Regular rendering for small lists
              <div className="homefeed-artwork-grid">
                {artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    id={parseInt(artwork.id) || 0}
                    artworkImage={artwork.images[0]}
                    artistAvatar={artwork.artistAvatar || '/artist.png'}
                    artistName={artwork.artistName}
                    artistId={artwork.artistId}
                    currentUserId={appUser?.uid}
                    title={artwork.title}
                    description={artwork.description}
                    onCardClick={() => handleArtworkClick(artwork.id)}
                    onShare={() => handleShare(artwork.id)}
                    onSave={() => handleSave(artwork.id)}
                    isSaved={savedArtworks.has(artwork.id)}
                  />
                ))}
              </div>
            ) : (
              // Virtualized Grid for large lists
              <ArtworkGrid
                artworks={artworks.map(artwork => ({
                  id: artwork.id,
                  title: artwork.title,
                  artworkImage: artwork.images[0],
                  artistName: artwork.artistName,
                  artistAvatar: artwork.artistAvatar || '/artist.png',
                  artistId: artwork.artistId,
                  price: artwork.price,
                  sold: artwork.sold,
                }))}
                viewType="homefeed"
                savedArtworks={savedArtworks}
                onArtworkClick={handleArtworkClick}
                onSave={handleSave}
                currentUserId={appUser?.uid}
              />
            )}
            {loadingMore && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '20px',
                width: '100%'
              }}>
                <div style={{
                  border: '3px solid var(--primary-alpha-20)',
                  borderTop: '3px solid var(--primary)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            )}
            {!hasMore && artworks.length > 0 && (
              <div style={{
                textAlign: 'center',
                padding: '5px',
                color: 'var(--color-royal)',
                fontSize: '14px'
              }}>
                You've reached the end.
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen Story Modal */}
      {selectedStory && (
        <div className="story-fullscreen" onClick={handleCloseStory}>
          <div className="story-fullscreen-content" onClick={(e) => e.stopPropagation()}>            {/* Progress bars for multiple stories */}
            {selectedStory.id !== 'default-story' && (
              <div className="story-progress-bars">
                {currentUserStories.map((story, index) => (
                  <div 
                    key={story.id} 
                    className={`story-progress-bar ${
                      index < currentStoryIndex ? 'viewed' : 
                      index === currentStoryIndex ? 'active' : ''
                    }`}
                  >
                    {index === currentStoryIndex && !isPaused && (
                      <div 
                        key={`${story.id}-${currentStoryIndex}`}
                        className="story-progress-fill" 
                        style={{ animation: 'progressFill 5s linear forwards' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
                        <button className="story-close-btn" onClick={handleCloseStory}>
              ✕
            </button>
            {selectedStory.id === 'default-story' ? (
              <div className="default-story-content">
                <div className="default-story-icon">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h2 className="default-story-title">Welcome to Stories!</h2>
                <p className="default-story-text">
                  Stories are a great way to share your artwork with the community for 24 hours.
                </p>
                <div className="default-story-features">
                  <div className="default-story-feature">
                    <span className="feature-emoji">📸</span>
                    <p>Share your artworks as stories</p>
                  </div>
                  <div className="default-story-feature">
                    <span className="feature-emoji">⏰</span>
                    <p>Stories last for 24 hours</p>
                  </div>
                  <div className="default-story-feature">
                    <span className="feature-emoji">👥</span>
                    <p>Follow artists to see their stories</p>
                  </div>
                </div>
                <button className="default-story-btn" onClick={() => { handleCloseStory(); navigate('/discover'); }}>
                  Discover Artists
                </button>
              </div>
            ) : (
              <>
                <div className="story-image-wrapper" onClick={handleImageClick}>
                  <img 
                    src={selectedStory.image} 
                    alt={selectedStory.name} 
                    className="story-fullscreen-image"
                  />
                  {selectedStory.price && <div className="story-price">{selectedStory.price}</div>}
                </div>
                <div className="story-fullscreen-info">
                  <img src={selectedStory.userIcon} alt={selectedStory.name} className="story-fullscreen-avatar" />
                  <span 
                    className="story-fullscreen-name" 
                    onClick={() => { 
                      handleCloseStory(); 
                      const isOwnStory = selectedStory.artistId === appUser?.uid;
                      navigate(isOwnStory ? '/portfolio' : `/portfolio/${selectedStory.artistId}`); 
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {selectedStory.name}
                  </span>
                </div>
                <div className="story-fullscreen-actions">
                  <div className="story-buttons">
                    <button className="story-btn story-btn-primary" onClick={() => { handleCloseStory(); sessionStorage.setItem('artworkSourceRoute', '/home'); navigate(`/card/${selectedStory.artworkId}`); }}>
                      View Details
                    </button>
                    {selectedStory.artistId === appUser?.uid ? (
                      <button className="story-btn story-btn-delete" onClick={handleDeleteStory}>
                        Delete Story
                      </button>
                    ) : (
                      <button className="story-btn story-btn-secondary">
                        Reach Out
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        type="danger"
        title="Delete Story?"
        message="This will permanently delete this story. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    padding: '0',
    margin: '0 -0.5rem',
  },
};

export default HomeFeed;
