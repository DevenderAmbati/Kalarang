import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import ArtworkGrid from '../components/ArtworkGrid';
import FilterPanel, { FilterState } from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { getPublishedArtworks } from '../services/artworkService';
import { Artwork as ArtworkType } from '../types/artwork';
import laptopAnimation from '../animations/Laptop-Drawing 1.json';
import noContentAnimation from '../animations/no content.json';
import './Discover.css';

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

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { appUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<ArtworkType[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    mediums: [],
    priceRange: { min: 100, max: 200000 },
    sizes: [],
  });

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    try {
      setLoading(true);
      const fetchedArtworks = await getPublishedArtworks(50);
      setArtworks(fetchedArtworks);
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
    console.log('Artwork clicked:', id);
    // Navigate to artwork detail page
    // navigate(`/artwork/${id}`);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterPanelOpen(false);
    console.log('Filters applied:', newFilters);
    // Apply filtering logic here
  };

  const handleCancelFilters = () => {
    setIsFilterPanelOpen(false);
  };

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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="discover-filter-btn"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              aria-label="Open filters"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
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
          ) : artworks.length === 0 ? (
            <EmptyState
              animation={noContentAnimation}
              title="No Artworks Found"
              description="Check back later for amazing new artworks from talented artists."
              actionLabel="Go to Home"
              actionPath="/feed"
            />
          ) : (
            <ArtworkGrid 
              artworks={artworks.map(artwork => ({
                id: artwork.id,
                title: artwork.title,
                artworkImage: artwork.images[0],
                artistName: artwork.artistName,
                artistAvatar: artwork.artistAvatar || '/artist.png',
                price: artwork.price,
              }))} 
              onArtworkClick={handleArtworkClick} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
