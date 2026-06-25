import React, { useState, useRef } from 'react';
import { Upload, X, Crop, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../../services/api';

const ImageCropUpload = ({ currentImage, onImageUpdate, userName = 'User' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [cropMode, setCropMode] = useState('scale'); // 'scale' or 'zoom'
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImage(event.target.result);
      setZoom(1);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Apply crop and save
  const handleApplyCrop = async () => {
    if (!tempImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size (400x400 for square profile pic)
      canvas.width = 400;
      canvas.height = 400;

      // Calculate scaling
      const maxDim = Math.max(img.width, img.height);
      const scale = (400 / maxDim) * zoom;

      // Center the image
      const x = (400 - img.width * scale) / 2;
      const y = (400 - img.height * scale) / 2;

      // Clear and draw
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        uploadImage(blob);
      }, 'image/jpeg', 0.9);
    };

    img.src = tempImage;
  };

  // Upload image to backend
  const uploadImage = async (blob) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');

      const response = await api.post('/auth/update-avatar', formData);

      if (response.data.success) {
        // Update preview with full URL if needed
        let newAvatarUrl = response.data.avatar;
        if (newAvatarUrl && newAvatarUrl.startsWith('/uploads/')) {
          const apiBase = import.meta.env.VITE_BACKEND_URL || '';
          newAvatarUrl = apiBase + newAvatarUrl;
        }
        setPreview(newAvatarUrl);
        setIsOpen(false);
        setTempImage(null);

        // Update localStorage user object
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.avatar = newAvatarUrl;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }

        // Callback to parent
        if (onImageUpdate) {
          onImageUpdate(newAvatarUrl);
        }

        alert('✅ Profile image updated successfully!');
        // No page reload; image will update via parent state
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const message = error?.response?.data?.message || error?.message || 'Please try again.';
      alert(`❌ Failed to upload image: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  // Reset crop
  const handleReset = () => {
    setZoom(1);
    setCropMode('scale');
  };

  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : 'U';
  };

  const getRoleGradient = () => {
    const name = userName?.toLowerCase() || '';
    if (name.includes('admin')) return 'from-green-500 to-emerald-500';
    if (name.includes('hr') || name.includes('vamsi')) return 'from-purple-500 to-violet-500';
    if (name.includes('staff')) return 'from-orange-500 to-amber-500';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <>
      {/* Avatar Display */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <img
            src={preview && preview.startsWith('/uploads/') ? `${import.meta.env.VITE_BACKEND_URL || ''}${preview}` : preview}
            alt={userName}
            className="w-40 h-40 rounded-full object-cover border-4 border-indigo-500 shadow-2xl"
          />
          {/* Badge - Shows Image if Uploaded, Otherwise Shows Initial */}
          <div className={`absolute bottom-0 right-0 w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br ${getRoleGradient()}`}>
            {preview && preview.includes('data:') ? (
              // Show uploaded image cropped in badge
              <img
                src={preview}
                alt="badge"
                className="w-full h-full object-cover"
              />
            ) : preview !== `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName?.toLowerCase().replace(/\s+/g, '')}` ? (
              // Show uploaded image in badge
              <img
                src={preview}
                alt="badge"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              // Show initial as fallback
              <span className="text-white font-bold text-2xl">{getInitial()}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 m-auto w-40 h-40 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
          >
            <Upload className="w-8 h-8 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload Profile Picture
        </button>
      </div>

      {/* Crop Modal */}
      {isOpen && tempImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center rounded-t-3xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Crop className="w-6 h-6" /> Crop Profile Picture
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="p-8 space-y-6">
              <div className="border-4 border-indigo-300 rounded-2xl overflow-hidden flex items-center justify-center h-96" style={{ background: '#fff', position: 'relative', boxShadow: '0 0 0 8px #fff' }}>
                <div style={{ background: '#fff', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}></div>
                <img
                  src={tempImage}
                  alt="Crop preview"
                  style={{
                    transform: cropMode === 'zoom' ? `scale(${zoom})` : `scale(${zoom})`,
                    transformOrigin: 'center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    background: '#fff',
                    display: 'block',
                    position: 'relative',
                    zIndex: 2
                  }}
                  className="object-contain"
                />
              </div>

              {/* Crop Mode Selection */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCropMode('scale')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    cropMode === 'scale'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'
                  }`}
                >
                  Scale Mode
                </button>
                <button
                  onClick={() => setCropMode('zoom')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    cropMode === 'zoom'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white'
                  }`}
                >
                  Zoom Mode
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-4">
                <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>Zoom: <span className="font-bold text-indigo-600">{zoom.toFixed(1)}x</span></p>
              </div>

              {/* Canvas (hidden) */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-300 dark:bg-slate-600 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-400 dark:hover:bg-slate-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCrop}
                  disabled={uploading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {uploading ? '⏳ Uploading...' : '✓ Apply & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageCropUpload;
