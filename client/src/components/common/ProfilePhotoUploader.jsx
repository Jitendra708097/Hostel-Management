// src/components/ProfilePhotoUploader.js
import { useController } from "react-hook-form";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from '../../utils/canvasPreview';
// import { Camera } from "react-icons/fa";
// This should be the final version of your uploader component

const ProfilePhotoUploader = ({ name, control, setError }) => {
    // This hook correctly connects this component to the main form state
    const { field } = useController({ name, control });

    const [sourceImage, setSourceImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);

    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);

     const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
        setCrop(crop);
    };

    const handleFileChange = (e) => {
        // ... (rest of the function is the same)
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError(name, { type: 'manual', message: 'Image must be less than 5MB.' });
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => setSourceImage(reader.result.toString() || ''));
            reader.readAsDataURL(file);
            setIsModalOpen(true);
        }
    };

    const handleCropImage = async () => {
        // ... (rest of the function is the same)
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) return;
        
        await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
        
        previewCanvasRef.current.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
            
            // This is the crucial line that updates the React Hook Form state
            field.onChange(file); 
            
            setPreviewUrl(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.95);
        
        setIsModalOpen(false);
    };

    // ... (the rest of the component's JSX and functions are the same)
    // ... handleRemoveImage, onImageLoad, the return statement, etc.
    // ... all of that code is correct.
  const handleRemoveImage = () => {
    field.onChange(null);
    setPreviewUrl('');
    setSourceImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="relative">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-2"
              >
                <X size={16} />
              </motion.button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-32 h-32 bg-gray-100 rounded-full flex flex-col items-center justify-center cursor-pointer border-2 border-dashed hover:border-indigo-500 transition-colors"
            >
              <Camera className="text-gray-400 mb-1" size={32} />
              <span className="text-xs text-gray-500 font-medium">Add Photo</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Cropper Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Crop Your Photo</h3>
              {sourceImage && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img ref={imgRef} alt="Crop me" src={sourceImage} onLoad={onImageLoad} />
                </ReactCrop>
              )}
              <div className="flex justify-end space-x-3 mt-5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
                <button type="button" onClick={handleCropImage} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center">
                  <Check className="mr-2" size={18} /> Crop & Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for generating blob */}
      <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default ProfilePhotoUploader;