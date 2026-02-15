import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ArtworkGrid from '../../components/Artwork/ArtworkGrid';
import FilterPanel, { FilterState } from '../../components/Filters/FilterPanel';
import LoadingState from '../../components/State/LoadingState';
import EmptyState from '../../components/State/EmptyState';
import { getPublishedArtworks } from '../../services/artworkService';
import { saveArtworkToFavorites, removeArtworkFromFavorites, isArtworkInFavorites } from '../../services/interactionService';
import { Artwork as ArtworkType } from '../../types/artwork';
import laptopAnimation from '../../animations/Laptop-Drawing 1.json';
import noContentAnimation from '../../animations/no content.json';
import { toast } from 'react-toastify';
import './Discover.css';

// Size categories with dimensions in inches
const SIZE_CATEGORIES = [
  { label: 'Small', minWidth: 0, maxWidth: 8, minHeight: 0, maxHeight: 8 },
  { label: 'Medium', minWidth: 8, maxWidth: 18, minHeight: 8, maxHeight: 18 },
  { label: 'Large', minWidth: 18, maxWidth: 500, minHeight: 18, maxHeight: 500 },
];

const CATEGORIES = [
  'All',
  'Abstract',
  'Landscape',
  'Portrait',
  'Modern',
  'Craft',
  'Digital',
  'Sculpture',
];

const parseInches = (value?: string): number | null => {
  if (!value) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'price-low' | 'price-high' | 'newest'>('newest');
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<ArtworkType[]>([]);
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    mediums: [],
    priceRange: { min: 100, max: 200000 },
    sizes: [],
  });

  useEffect(() => {
    loadArtworks();
  }, [appUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSortDropdownOpen && !target.closest('.discover-filter-btn')) {
        setIsSortDropdownOpen(false);
      }
      if (showSuggestions && !target.closest('.discover-search-bar')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSortDropdownOpen, showSuggestions]);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const fetchedArtworks = await getPublishedArtworks(50);
      setArtworks(fetchedArtworks);

      // Load saved artworks if user is logged in
      if (appUser) {
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
      }
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleArtworkClick = (id: string) => {
    navigate(`/card/${id}`);
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

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterPanelOpen(false);
  };

  const handleCancelFilters = () => {
    setIsFilterPanelOpen(false);
  };

  const handleSortSelect = (option: 'price-low' | 'price-high' | 'newest') => {
    setSortOption(option);
    setIsSortDropdownOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  // Generate search suggestions based on query
  const getSearchSuggestions = () => {
    if (!searchQuery.trim() || artworks.length === 0) return [];

    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    artworks.forEach(artwork => {
      // Match in title
      if (artwork.title?.toLowerCase().includes(query)) {
        suggestions.add(artwork.title);
      }
      // Match in artist name
      if (artwork.artistName?.toLowerCase().includes(query)) {
        suggestions.add(artwork.artistName);
      }
      // Match in category
      if (artwork.category?.toLowerCase().includes(query)) {
        suggestions.add(artwork.category);
      }
      // Match in medium
      if (artwork.medium?.toLowerCase().includes(query)) {
        suggestions.add(artwork.medium);
      }
    });

    return Array.from(suggestions).slice(0, 6);
  };

  // Filter artworks based on active category and filters
  const filteredArtworks = artworks.filter(artwork => {
    // Search query filter - search in title, description, artist name, category, and medium
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        artwork.title?.toLowerCase().includes(query) ||
        artwork.description?.toLowerCase().includes(query) ||
        artwork.artistName?.toLowerCase().includes(query) ||
        artwork.category?.toLowerCase().includes(query) ||
        artwork.medium?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (activeCategory !== 'All') {
      if (artwork.category?.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
    }

    // Medium filter
    if (filters.mediums.length > 0) {
      if (!filters.mediums.some(medium => 
        artwork.medium?.toLowerCase() === medium.toLowerCase()
      )) {
        return false;
      }
    }

    // Price filter
    if (artwork.price < filters.priceRange.min || artwork.price > filters.priceRange.max) {
      return false;
    }

    // Size filter (if you have width/height fields)
    if (filters.sizes.length > 0) {
      const width = parseInches(artwork.width);
      const height = parseInches(artwork.height);

      // If artwork doesn't have dimensions, exclude it from size-filtered results
      if (width === null || height === null) {
        return false;
      }

      // Check if artwork matches any of the selected size categories
      const matchesSize = filters.sizes.some(selectedSize => {
        const sizeCategory = SIZE_CATEGORIES.find(s => s.label === selectedSize);
        if (!sizeCategory) return false;

        return (
          width >= sizeCategory.minWidth &&
          width <= sizeCategory.maxWidth &&
          height >= sizeCategory.minHeight &&
          height <= sizeCategory.maxHeight
        );
      });

      if (!matchesSize) {
        return false;
      }
    }

    return true;
  });

  // Sort filtered artworks
  const sortedArtworks = React.useMemo(() => {
    return [...filteredArtworks].sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        default:
          return 0;
      }
    });
  }, [filteredArtworks, sortOption]);

  return (
    <Layout onLogout={handleLogout} pageTitle="Discover">
      <div className="discover-container">
        <div className="discover-header">
          <p className="discover-description">
            Explore curated artwork from talented artists.
          </p>
        </div>

        {/* Search Bar */}
        <div className="discover-search-container">
          <div className="discover-search-bar">
            <svg className="discover-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="discover-search-input"
              placeholder="Search by style, category, medium, artist"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && getSearchSuggestions().length > 0 && (
              <div className="discover-search-suggestions">
                {getSearchSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    className="discover-search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            <div className="discover-btn-wrapper">
              <button
                className="discover-filter-btn"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                aria-label="Sort options"
                style={{ position: 'relative' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 15 5 5 5-5" />
                  <path d="m7 9 5-5 5 5" />
                </svg>
                {isSortDropdownOpen && (
                <div 
                  className="discover-sort-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="discover-sort-option"
                    onClick={() => handleSortSelect('price-low')}
                  >
                    Price: Low to High
                  </button>
                  <button
                    className="discover-sort-option"
                    onClick={() => handleSortSelect('price-high')}
                  >
                    Price: High to Low
                  </button>
                  <button
                    className="discover-sort-option"
                    onClick={() => handleSortSelect('newest')}
                  >
                    Latest First
                  </button>
                </div>
              )}
              </button>
              <span className="discover-tooltip">Sort</span>
            </div>
            <div className="discover-btn-wrapper">
              <button
                className="discover-filter-btn"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                aria-label="Open filters"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
              <span className="discover-tooltip">Filter</span>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterPanelOpen && (
            <div 
              className="discover-filter-panel-wrapper"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsFilterPanelOpen(false);
                }
              }}
            >
              <FilterPanel
                initialFilters={filters}
                onApply={handleApplyFilters}
                onCancel={handleCancelFilters}
              />
            </div>
          )}
        </div>

        {/* Category Chips */}
        <div className="discover-categories">
          <div className="discover-categories-scroll">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`discover-category-chip ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="discover-content">
          {loading ? (
            <LoadingState 
              animation={laptopAnimation}
              message="Discovering artworks..." 
              fullHeight 
            />
          ) : sortedArtworks.length === 0 ? (
            <EmptyState
              animation={noContentAnimation}
              title="No Artworks Found"
              description="Check back later for amazing new artworks from talented artists."
              actionLabel="Go to Home"
              actionPath="/feed"
            />
          ) : (
            <ArtworkGrid 
              artworks={sortedArtworks.map(artwork => ({
                id: artwork.id,
                title: artwork.title,
                artworkImage: artwork.images[0],
                artistName: artwork.artistName,
                artistAvatar: artwork.artistAvatar || '/artist.png',
                price: artwork.price,
                sold: artwork.sold,
              }))} 
              onArtworkClick={handleArtworkClick}
              onSave={handleSave}
              savedArtworks={savedArtworks}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
