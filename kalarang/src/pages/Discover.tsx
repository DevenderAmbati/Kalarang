import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import ArtworkGrid from '../components/ArtworkGrid';
import FilterPanel, { FilterState } from '../components/FilterPanel';
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

// Mock data for demonstration
const MOCK_ARTWORKS = [
  {
    id: '1',
    title: 'Sunset Dreams',
    artworkImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    artistName: 'Priya Sharma',
    artistAvatar: 'https://i.pravatar.cc/150?img=1',
    price: 15000,
  },
  {
    id: '2',
    title: 'Urban Symphony',
    artworkImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    artistName: 'Rajesh Kumar',
    artistAvatar: 'https://i.pravatar.cc/150?img=2',
    price: 25000,
  },
  {
    id: '3',
    title: 'Nature\'s Canvas',
    artworkImage: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800',
    artistName: 'Ananya Desai',
    artistAvatar: 'https://i.pravatar.cc/150?img=3',
    price: 18000,
  },
  {
    id: '4',
    title: 'Abstract Thoughts',
    artworkImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
    artistName: 'Vikram Singh',
    artistAvatar: 'https://i.pravatar.cc/150?img=4',
    price: 22000,
  },
  {
    id: '5',
    title: 'Ethereal Beauty',
    artworkImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800',
    artistName: 'Meera Patel',
    artistAvatar: 'https://i.pravatar.cc/150?img=5',
    price: 30000,
  },
  {
    id: '6',
    title: 'Modern Minimalism',
    artworkImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800',
    artistName: 'Arjun Mehta',
    artistAvatar: 'https://i.pravatar.cc/150?img=6',
    price: 20000,
  },
  {
    id: '7',
    title: 'Golden Hour',
    artworkImage: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=800',
    artistName: 'Kavita Reddy',
    artistAvatar: 'https://i.pravatar.cc/150?img=7',
    price: 28000,
  },
  {
    id: '8',
    title: 'Ocean Whispers',
    artworkImage: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    artistName: 'Aditya Joshi',
    artistAvatar: 'https://i.pravatar.cc/150?img=8',
    price: 19500,
  },
  {
    id: '9',
    title: 'Mountain Majesty',
    artworkImage: 'https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?w=800',
    artistName: 'Sneha Gupta',
    artistAvatar: 'https://i.pravatar.cc/150?img=9',
    price: 32000,
  },
  {
    id: '10',
    title: 'City Lights',
    artworkImage: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800',
    artistName: 'Rohit Sharma',
    artistAvatar: 'https://i.pravatar.cc/150?img=10',
    price: 24000,
  },
  {
    id: '11',
    title: 'Floral Dreams',
    artworkImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    artistName: 'Deepa Nair',
    artistAvatar: 'https://i.pravatar.cc/150?img=11',
    price: 17000,
  },
  {
    id: '12',
    title: 'Cosmic Journey',
    artworkImage: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
    artistName: 'Karan Malhotra',
    artistAvatar: 'https://i.pravatar.cc/150?img=12',
    price: 35000,
  },
  {
    id: '13',
    title: 'Serene Waters',
    artworkImage: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800',
    artistName: 'Nisha Kapoor',
    artistAvatar: 'https://i.pravatar.cc/150?img=13',
    price: 21000,
  },
  {
    id: '14',
    title: 'Desert Sunset',
    artworkImage: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800',
    artistName: 'Sameer Khan',
    artistAvatar: 'https://i.pravatar.cc/150?img=14',
    price: 26000,
  },
  {
    id: '15',
    title: 'Forest Mystique',
    artworkImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    artistName: 'Isha Verma',
    artistAvatar: 'https://i.pravatar.cc/150?img=15',
    price: 23000,
  },
  {
    id: '16',
    title: 'Vintage Elegance',
    artworkImage: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800',
    artistName: 'Rahul Deshmukh',
    artistAvatar: 'https://i.pravatar.cc/150?img=16',
    price: 29000,
  },
];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    mediums: [],
    priceRange: { min: 100, max: 200000 },
    sizes: [],
  });

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
          <ArtworkGrid artworks={MOCK_ARTWORKS} onArtworkClick={handleArtworkClick} />
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
