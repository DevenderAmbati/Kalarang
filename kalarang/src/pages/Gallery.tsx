import React from 'react';
import GalleryTab, { GalleryImage } from '../components/GalleryTab';

// Mock gallery images with varied aspect ratios for demonstration
const MOCK_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
    alt: 'Abstract artistic composition',
    aspectRatio: 1.2
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
    alt: 'Colorful modern art piece',
    aspectRatio: 0.8
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600',
    alt: 'Contemporary digital artwork',
    aspectRatio: 1.5
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600',
    alt: 'Mixed media sculpture',
    aspectRatio: 0.75
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=600',
    alt: 'Expressive portrait artwork',
    aspectRatio: 1.1
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600',
    alt: 'Nature-inspired painting',
    aspectRatio: 1.3
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    alt: 'Urban street art',
    aspectRatio: 0.9
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
    alt: 'Minimalist geometric design',
    aspectRatio: 1.6
  },
  {
    id: '9',
    src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600',
    alt: 'Vibrant floral arrangement',
    aspectRatio: 1.4
  },
  {
    id: '10',
    src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600',
    alt: 'Surreal landscape painting',
    aspectRatio: 0.7
  },
  {
    id: '11',
    src: 'https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=600',
    alt: 'Bold abstract expressionism',
    aspectRatio: 1.8
  },
  {
    id: '12',
    src: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600',
    alt: 'Delicate watercolor study',
    aspectRatio: 0.6
  },
  {
    id: '13',
    src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600',
    alt: 'Dynamic sculpture installation',
    aspectRatio: 1.0
  },
  {
    id: '14',
    src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    alt: 'Ethereal mountain landscape',
    aspectRatio: 1.3
  },
  {
    id: '15',
    src: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=600',
    alt: 'Textured mixed media collage',
    aspectRatio: 0.85
  },
  {
    id: '16',
    src: 'https://images.unsplash.com/photo-1551913902-c92207136625?w=600',
    alt: 'Intricate pen and ink drawing',
    aspectRatio: 1.1
  },
  {
    id: '17',
    src: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=600',
    alt: 'Impressionist garden scene',
    aspectRatio: 1.5
  },
  {
    id: '18',
    src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
    alt: 'Dramatic chiaroscuro portrait',
    aspectRatio: 0.75
  },
  {
    id: '19',
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    alt: 'Experimental digital art',
    aspectRatio: 1.2
  },
  {
    id: '20',
    src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    alt: 'Serene still life composition',
    aspectRatio: 0.9
  }
];

const Gallery: React.FC = () => {
  const handleImageClick = (imageId: string) => {
    console.log('Gallery image clicked:', imageId);
    // In a real implementation, this would open a lightbox or navigate to detail view
  };

  return (
    <div style={styles.container}>
      
      <div style={styles.content}>
        <GalleryTab 
          images={MOCK_GALLERY_IMAGES} 
          onImageClick={handleImageClick}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem 0',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 600,
    color: 'var(--color-text-primary-light)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    marginTop: '-1rem',
  },
};

export default Gallery;