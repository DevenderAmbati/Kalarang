import React from 'react';

interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
}

interface ImagePreviewGridProps {
  images: ImagePreview[];
  onRemoveImage: (id: string) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  maxImages?: number;
}

const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({
  images,
  onRemoveImage,
  onDragStart,
  onDragOver,
  onDragEnd,
  maxImages = 6,
}) => {
  // Create empty slots to fill the grid
  const displayItems = [...images];
  const remainingSlots = Math.max(0, maxImages - images.length);
  
  for (let i = 0; i < remainingSlots; i++) {
    displayItems.push({} as ImagePreview);
  }

  // Only show up to maxImages
  const limitedItems = displayItems.slice(0, maxImages);

  return (
    <div className="image-preview-grid">
      {limitedItems.map((image, index) => (
        <div 
          key={image.id || `empty-${index}`} 
          className="preview-item"
          draggable={!!image.url}
          onDragStart={() => onDragStart && onDragStart(index)}
          onDragOver={(e) => onDragOver && onDragOver(e, index)}
          onDragEnd={onDragEnd}
          style={{ 
            cursor: image.url ? 'grab' : 'default',
            opacity: image.url ? 1 : 1,
          }}
        >
          {image.url ? (
            <>
              <img
                src={image.url}
                alt={`Preview ${index + 1}`}
                className="preview-image"
                style={{ pointerEvents: 'none' }}
              />
              <div className="preview-badge">{index + 1}</div>
              
              <button
                type="button"
                className="preview-remove"
                onClick={() => onRemoveImage(image.id)}
                title="Remove image"
              >
                ×
              </button>
            </>
          ) : (
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--color-bg-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '2rem',
                opacity: 0.3,
              }}
            >
              +
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewGrid;