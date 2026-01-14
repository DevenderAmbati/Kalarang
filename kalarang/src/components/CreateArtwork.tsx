import React, { useState, useCallback } from 'react';
import UploadDropzone from './UploadDropzone';
import ImagePreviewGrid from './ImagePreviewGrid';
import ArtworkMetadataForm, { ArtworkFormData } from './ArtworkMetadataForm';
import './CreateArtwork.css';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

const CreateArtwork: React.FC = () => {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    createdDate: '',
    category: '',
    medium: '',
    width: '',
    height: '',
    price: '',
  });

  const maxImages = 6;

  const createImagePreview = (file: File): ImagePreview => ({
    id: `${Date.now()}-${Math.random()}`,
    file,
    url: URL.createObjectURL(file),
  });

  const handleFileSelect = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const remainingSlots = maxImages - images.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);
    
    const newPreviews = filesToAdd.map(createImagePreview);
    setImages(prev => [...prev, ...newPreviews]);
    setIsDragActive(false);
  }, [images.length, maxImages]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up URL
      const removedImage = prev.find(img => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.url);
      }
      return updated;
    });
  }, []);

  const handleDragEnter = useCallback(() => {
    if (images.length < maxImages) {
      setIsDragActive(true);
    }
  }, [images.length, maxImages]);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((files: File[]) => {
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleFormDataChange = useCallback((field: keyof ArtworkFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSaveToGallery = () => {
    console.log('Save to gallery:', { images, formData });
    // TODO: Implement save to gallery logic
  };

  const handlePublish = () => {
    console.log('Publish artwork:', { images, formData });
    // TODO: Implement publish logic
  };

  const isFormValid = formData.title.trim() && formData.category && formData.medium && formData.price && images.length > 0;

  return (
    <div className="create-artwork-container">
      <div className="create-artwork-header">
        <p className="create-artwork-subtitle">
          Share your latest creation with the Kalarang community.
        </p>
      </div>

      <div className="create-artwork-form">
        {/* Basic Details Section */}
        <div className="section">
          <h3 className="section-title">Upload Images</h3>
          <div className="upload-section">
            <UploadDropzone
              onFileSelect={handleFileSelect}
              isDragActive={isDragActive}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-royal)',
                marginBottom: '1rem',
              }}>
                Preview ({images.length}/{maxImages})
              </h4>
              <ImagePreviewGrid
                images={images}
                onRemoveImage={handleRemoveImage}
                maxImages={maxImages}
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <ArtworkMetadataForm
          formData={formData}
          onFormDataChange={handleFormDataChange}
        />

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleSaveToGallery}
          >
            Save artwork to gallery
          </button>
          
          <div className="button-group">
            <button
              type="button"
              className="button button-primary"
              onClick={handlePublish}
              disabled={!isFormValid}
            >
              Publish artwork to feature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateArtwork;