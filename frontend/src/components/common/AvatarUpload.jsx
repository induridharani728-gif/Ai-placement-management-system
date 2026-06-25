import React, { useState } from 'react';
import api from '../../utils/api';

const AvatarUpload = ({ user, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user.avatar);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/auth/update-avatar', formData);
      onUpdate(res.data.avatar);
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      const message = err?.response?.data?.message || err?.message || 'Please try again.';
      alert(`Upload failed: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-12">
      <div className="relative">
        <img src={preview} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl" />
        <label className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input type="file" onChange={handleUpload} className="hidden" accept="image/*" disabled={uploading} />
        </label>
      </div>
      {uploading && <p className="mt-4 text-blue-600 font-semibold">Uploading...</p>}
    </div>
  );
};

export default AvatarUpload;
