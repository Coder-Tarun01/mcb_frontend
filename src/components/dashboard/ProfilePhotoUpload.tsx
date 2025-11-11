import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ProfilePhotoUploadProps {
  currentAvatarUrl?: string;
  userName?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showTitle?: boolean;
  userTitle?: string;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentAvatarUrl,
  userName = 'User',
  onAvatarUpdate,
  size = 'md',
  showName = true,
  showTitle = true,
  userTitle = 'Professional'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { avatar: 'w-12 h-12', camera: 'w-4 h-4', cameraButton: 'w-5 h-5' },
    md: { avatar: 'w-16 h-16', camera: 'w-3 h-3', cameraButton: 'w-6 h-6' },
    lg: { avatar: 'w-24 h-24', camera: 'w-4 h-4', cameraButton: 'w-8 h-8' }
  };

  const config = sizeConfig[size];

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Start upload
    uploadFile(file);
  };

  // Upload file to S3
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to backend (which uploads to S3)
      const response = await authAPI.uploadAvatar(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(response.avatarUrl);
      }

      toast.success('Profile photo updated successfully! 🎉');

      // Clean up preview after success
      setTimeout(() => {
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo. Please try again.');
      setPreviewUrl(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle camera button click
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        {/* Avatar Container */}
        <div
          className={`${config.avatar} rounded-full border-2 border-gray-300 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold text-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
            dragActive ? 'border-blue-500 shadow-lg' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleCameraClick}
        >
          {/* Avatar Image or Initials */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : currentAvatarUrl ? (
            (() => {
              const isAbsolute = /^https?:\/\//i.test(currentAvatarUrl);
              const src = isAbsolute ? currentAvatarUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${currentAvatarUrl.startsWith('/') ? '' : '/'}${currentAvatarUrl}`;
              return (
                <img
                  src={src}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              );
            })()
          ) : (
            <span>{getInitials(userName)}</span>
          )}

          {/* Upload Progress Overlay */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-xs">{uploadProgress}%</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag Overlay */}
          <AnimatePresence>
            {dragActive && !isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center"
              >
                <div className="text-center text-blue-600">
                  <Upload className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-xs font-medium">Drop image here</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Camera Button */}
        <button
          className={`absolute -bottom-1 -right-1 ${config.cameraButton} bg-white border-2 border-blue-500 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleCameraClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Camera className={`${config.camera} text-blue-500`} />
          )}
        </button>

        {/* Cancel Upload Button */}
        <AnimatePresence>
          {isUploading && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-sm"
              onClick={handleCancelUpload}
            >
              <X className="w-3 h-3 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* User Name */}
      {showName && (
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {userName}
        </h2>
      )}

      {/* User Title */}
      {showTitle && (
        <p className="text-sm text-gray-500">
          {userTitle}
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Instructions */}
      <div className="mt-2 text-xs text-gray-400">
        Click camera icon to upload photo
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
