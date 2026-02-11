import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import UploadDropzone from './UploadDropzone';
import ImagePreviewGrid from './ImagePreviewGrid';
import ArtworkMetadataForm, { ArtworkFormData } from './ArtworkMetadataForm';
import { useAuth } from '../context/AuthContext';
import { createArtwork, toggleArtworkPublish, getArtwork, updateArtwork, uploadArtworkImages } from '../services/artworkService';
import artAnimation from '../animations/Line art (1).json';
import publishAnimation from '../animations/Line art (2).json';
import './CreateArtwork.css';

interface ImagePreview {
  id: string;
  file: File;
  url: string;
}

const CreateArtwork: React.FC = () => {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editArtworkId = searchParams.get('edit');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [savedArtworkId, setSavedArtworkId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingArtwork, setIsLoadingArtwork] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    createdDate: '',
    category: '',
    medium: '',
    width: '',
    height: '',
    price: '',
    isCommissioned: false,
  });

  const maxImages = 6;

  // Load existing artwork if editing
  useEffect(() => {
    const loadArtwork = async () => {
      if (!editArtworkId || !appUser) return;

      setIsLoadingArtwork(true);
      try {
        const artwork = await getArtwork(editArtworkId);
        if (!artwork) {
          toast.error('Artwork not found');
          navigate('/post');
          return;
        }

        // Check if current user is the owner
        if (artwork.artistId !== appUser.uid) {
          toast.error('You can only edit your own artwork');
          navigate('/post');
          return;
        }

        // Set form data
        setFormData({
          title: artwork.title || '',
          description: artwork.description || '',
          createdDate: artwork.createdDate || '',
          category: artwork.category || '',
          medium: artwork.medium || '',
          width: artwork.width?.toString() || '',
          height: artwork.height?.toString() || '',
          price: artwork.price?.toString() || '',
          isCommissioned: artwork.isCommissioned || false,
        });

        // Set existing images
        setExistingImageUrls(artwork.images || []);
        setSavedArtworkId(editArtworkId);
      } catch (error) {
        console.error('Error loading artwork:', error);
        toast.error('Failed to load artwork');
        navigate('/post');
      } finally {
        setIsLoadingArtwork(false);
      }
    };

    loadArtwork();
  }, [editArtworkId, appUser, navigate]);

  const createImagePreview = (file: File): ImagePreview => ({
    id: `${Date.now()}-${Math.random()}`,
    file,
    url: URL.createObjectURL(file),
  });

  const handleFileSelect = useCallback((files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const totalCurrentImages = images.length + existingImageUrls.length;
    const remainingSlots = maxImages - totalCurrentImages;
    const filesToAdd = imageFiles.slice(0, remainingSlots);
    
    const newPreviews = filesToAdd.map(createImagePreview);
    setImages(prev => [...prev, ...newPreviews]);
    setIsDragActive(false);
    // Mark as having unsaved changes when editing
    if (editArtworkId) {
      setHasUnsavedChanges(true);
    }
  }, [images.length, existingImageUrls.length, maxImages, editArtworkId]);

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

  const handleRemoveExistingImage = useCallback((url: string) => {
    setExistingImageUrls(prev => prev.filter(imgUrl => imgUrl !== url));
    // Mark as having unsaved changes when editing
    if (editArtworkId) {
      setHasUnsavedChanges(true);
    }
  }, [editArtworkId]);

  const handleDragEnter = useCallback(() => {
    const totalCurrentImages = images.length + existingImageUrls.length;
    if (totalCurrentImages < maxImages) {
      setIsDragActive(true);
    }
  }, [images.length, existingImageUrls.length, maxImages]);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((files: File[]) => {
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleFormDataChange = useCallback((field: keyof ArtworkFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'isCommissioned' ? value === 'true' : value,
    }));
    // Mark as having unsaved changes when editing
    if (editArtworkId) {
      setHasUnsavedChanges(true);
    }
  }, [editArtworkId]);

  const handleSaveToGallery = async () => {
    if (!appUser) {
      toast.error('You must be logged in to save artwork');
      return;
    }

    // For updates, we can allow saving without new images if existing images exist
    if (images.length === 0 && existingImageUrls.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please add a title');
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      const artworkUpload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        medium: formData.medium,
        width: formData.width,
        height: formData.height,
        price: parseFloat(formData.price) || 0,
        isCommissioned: formData.isCommissioned,
        createdDate: formData.createdDate,
      };

      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let artworkId: string;

      if (editArtworkId && savedArtworkId) {
        // Update existing artwork
        console.log('Updating existing artwork:', editArtworkId);
        
        // Upload new images if any
        let newImageUrls: string[] = [];
        if (images.length > 0) {
          const imageFiles = images.map(img => img.file);
          newImageUrls = await uploadArtworkImages(appUser.uid, imageFiles);
        }

        // Combine existing and new image URLs
        const allImageUrls = [...existingImageUrls, ...newImageUrls];

        await updateArtwork(editArtworkId, {
          ...artworkUpload,
          images: allImageUrls,
        } as any);

        artworkId = editArtworkId;
        console.log('Artwork updated successfully:', artworkId);
      } else {
        // Create new artwork
        console.log('Creating new artwork...');
        const imageFiles = images.map(img => img.file);
        
        artworkId = await createArtwork(
          appUser.uid,
          appUser.name,
          undefined,
          artworkUpload,
          imageFiles
        );

        console.log('Artwork created successfully:', artworkId);
      }
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setUploadProgress(100);

      // Small delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));

      setSavedArtworkId(artworkId);
      toast.success(editArtworkId ? 'Artwork updated successfully!' : 'Artwork saved to gallery! You can now publish it to feature.');
      
      // Clear unsaved changes flag after successful save
      if (editArtworkId) {
        setHasUnsavedChanges(false);
      }
      
    } catch (error: any) {
      console.error('Error saving artwork:', error);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      toast.error(error.message || 'Failed to save artwork. Please try again.');
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsSaving(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handlePublish = async () => {
    if (!appUser) {
      toast.error('You must be logged in to publish artwork');
      return;
    }

    if (!savedArtworkId) {
      toast.error('Please save to gallery first');
      return;
    }

    setIsPublishing(true);

    try {
      await toggleArtworkPublish(savedArtworkId, true);

      toast.success('Artwork published successfully! It will now appear in Discover.');
      
      images.forEach(img => URL.revokeObjectURL(img.url));
      
      setImages([]);
      setFormData({
        title: '',
        description: '',
        createdDate: '',
        category: '',
        medium: '',
        width: '',
        height: '',
        price: '',
        isCommissioned: false,
      });
      setSavedArtworkId(null);

      setTimeout(() => {
        navigate('/portfolio');
      }, 1000);
    } catch (error: any) {
      console.error('Error publishing artwork:', error);
      toast.error(error.message || 'Failed to publish artwork. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const isFormValid = 
    formData.title.trim() && 
    formData.description.trim() && 
    formData.category && 
    formData.medium && 
    formData.width && 
    formData.height && 
    formData.price && 
    (images.length > 0 || existingImageUrls.length > 0);

  return (
    <>
      {/* Loading existing artwork */}
      {isLoadingArtwork && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ width: '200px', maxWidth: '90%', marginBottom: '2rem' }}>
            <Lottie 
              animationData={artAnimation}
              loop={true}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <p style={{ 
            color: 'var(--color-accent)', 
            fontSize: '1.25rem', 
            fontWeight: 600,
          }}>
            Loading Artwork...
          </p>
        </div>
      )}

      {/* Full Screen Loader for Saving */}
      {isSaving && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 31, 42, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ width: '250px', maxWidth: '90%', marginBottom: '2rem' }}>
            <Lottie 
              animationData={artAnimation} 
              loop={true}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <p style={{ 
            color: 'var(--color-accent)', 
            fontSize: '1.25rem', 
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            Saving to Gallery...
          </p>
          <p style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
            {uploadProgress}% Complete
          </p>
          <div style={{
            width: '300px',
            maxWidth: '90%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '1rem',
          }}>
            <div style={{
              width: `${uploadProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* Full Screen Loader for Publishing */}
      {isPublishing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 31, 42, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ width: '250px', maxWidth: '90%', marginBottom: '2rem' }}>
            <Lottie 
              animationData={publishAnimation} 
              loop={true}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <p style={{ 
            color: 'var(--color-accent)', 
            fontSize: '1.25rem', 
            fontWeight: 600,
            marginBottom: '0.5rem'
          }}>
            Publishing to Feature...
          </p>
          <p style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
            Your artwork will appear in Discover soon
          </p>
        </div>
      )}

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
                  Preview ({existingImageUrls.length + images.length}/{maxImages})
                </h4>
                {/* Show existing images */}
                {existingImageUrls.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                      Existing Images
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {existingImageUrls.map((url, index) => (
                        <div key={url} style={{ position: 'relative', width: '100px', height: '100px' }}>
                          <img 
                            src={url} 
                            alt={`Existing ${index + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover', 
                              borderRadius: '8px' 
                            }}
                          />
                          <button
                            onClick={() => handleRemoveExistingImage(url)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              color: '#e74c3c',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Show new images grid - always show when no existing images */}
                {existingImageUrls.length === 0 && (
                  <ImagePreviewGrid
                    images={images}
                    onRemoveImage={handleRemoveImage}
                    maxImages={maxImages}
                  />
                )}
                {/* Show new images when there are existing images */}
                {existingImageUrls.length > 0 && (
                  <div>
                    {images.length > 0 && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                        New Images
                      </p>
                    )}
                    <ImagePreviewGrid
                      images={images}
                      onRemoveImage={handleRemoveImage}
                      maxImages={maxImages - existingImageUrls.length}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <ArtworkMetadataForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />

          {savedArtworkId && (
            <div style={{
              margin: '1rem 0',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(47, 164, 169, 0.1), rgba(95, 209, 216, 0.1))',
              borderRadius: '8px',
              border: '1px solid var(--color-primary)',
            }}>
              <p style={{ 
                color: 'var(--color-primary)', 
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                ✓ Saved to Gallery
              </p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Your artwork is saved. Click "Publish to Feature" to make it visible in Discover.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="button-group">
            {/* Only show save/update button if not yet saved or if editing with unsaved changes */}
            {(!savedArtworkId || (!!editArtworkId && hasUnsavedChanges)) && (
              <button
                type="button"
                className="button button-outline-green"
                onClick={handleSaveToGallery}
                disabled={isSaving || isPublishing || (images.length === 0 && existingImageUrls.length === 0) || !formData.title.trim()}
              >
                {isSaving ? 'Saving...' : (editArtworkId ? 'Update Artwork' : 'Save to gallery')}
              </button>
            )}
            
            {!formData.isCommissioned && (
              <button
                type="button"
                className="button button-primary"
                onClick={handlePublish}
                disabled={isPublishing || isSaving || !savedArtworkId || !isFormValid || (!!editArtworkId && hasUnsavedChanges)}
                style={(!savedArtworkId || !isFormValid || (!!editArtworkId && hasUnsavedChanges)) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {isPublishing ? 'Publishing...' : 'Publish to feature'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateArtwork;