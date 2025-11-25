import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../config/axiosClient';

// Import icons from lucide-react
import { Upload, Camera, Loader2, FileCheck, XCircle } from 'lucide-react';

// --- Zod Schema for Validation ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

// A unique key for your form's data in localStorage
const FORM_STORAGE_KEY = 'circular-form-draft';

const circularSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
  circular: z
    .any()
    .refine((files) => files?.length === 1, 'File is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .jpg, .png, .webp, and .pdf files are accepted.'
    ),
});


// --- Main Component ---
const CircularsPage = ({ isAdmin }) => {
    // State for displaying circulars
    const [circulars, setCirculars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the view modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCircularUrl, setSelectedCircularUrl] = useState('');
    
    // State for upload process feedback
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');

    // State for file preview
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const {register, handleSubmit, formState: { errors }, reset, watch, setValue, } = useForm({
        resolver: zodResolver(circularSchema),
    });

    // Fetch all circulars from the backend
    const fetchCirculars = async () => {
        try {
            setLoading(true);
            // Ensure this endpoint matches your backend route
            const response = await axiosClient.get('/circular/');
            console.log("circulars: ",response);
            console.log("Response: ",response.data); 
            setCirculars(response.data || []);
            setError('');

        } catch (err) {
            setError('Failed to fetch circulars. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCirculars();
    }, []);

    // Handle file selection and generate a preview
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Set the file in react-hook-form's state
            setValue('circular', event.target.files, { shouldValidate: true });
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Form submission handler
    const onSubmit = async (data) => {
        // console.log("Data: ",data);

         const formData = new FormData();

        // Append text fields
         formData.append('title', data.title);
         formData.append('description', data.description);

        // --- THIS IS THE MOST IMPORTANT LINE ---
        // The first argument 'circular' MUST match the backend.
        // The second argument data.circular[0] gets the actual File object.
        formData.append('circular', data.circular[0])

        setIsUploading(true);
        setUploadError('');
        setUploadSuccess('');

        // console.log("fromdata: ",formData);

        try {
            const response = await axiosClient.post('/circular/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("response: ",response);
            setUploadSuccess('Circular uploaded successfully!');
            reset(); // Reset react-hook-form
            setPreview(null); // Clear the preview
            fetchCirculars(); // Refresh the table
            setTimeout(() => setUploadSuccess(''), 4000);

             // On success:
            // localStorage.removeItem(FORM_STORAGE_KEY);
            // reset(getInitialValues()); // Reset to a clean state
        } catch (err) {
            const message = err.response?.data?.msg || 'Failed to upload circular.';
            setUploadError(message);
        } finally {
            setIsUploading(false);
        }
    };
    
    const openModal = (url) => {
        setSelectedCircularUrl(url);
        setModalOpen(true);
    };

    // --- Admin Upload Section Component ---
    const AdminUploadSection = () => (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload New Circular</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* File Input and Preview Section */}
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                    <input type="file" accept={ACCEPTED_FILE_TYPES.join(',')} {...register('circular')} onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} ref={cameraInputRef} className="hidden" />

                    {preview ? (
                        <div className="mb-4 relative">
                            <img src={preview} alt="Preview" className="max-h-60 rounded-md mx-auto" />
                            <button type="button" onClick={() => { setPreview(null); reset({ circular: null }); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                               <XCircle size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                             <button type="button" onClick={() => fileInputRef.current.click()} className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                <Upload className="mr-2" size={20} />
                                Upload from Storage
                            </button>
                            <button type="button" onClick={() => cameraInputRef.current.click()} className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                                <Camera className="mr-2" size={20} />
                                Use Camera
                            </button>
                        </div>
                    )}
                </div>
                 {errors.circular && <p className="text-red-500 text-sm mt-2">{errors.circular.message}</p>}

                {/* Text Inputs */}
                <div className="mt-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Circular Title <span className="text-red-500">*</span></label>
                    <input type="text" id="title" {...register('title')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div className="mt-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                    <textarea id="description" {...register('description')} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="mt-6 text-right">
                    <button type="submit" disabled={isUploading} className=" cursor-pointer inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300">
                        {isUploading ? <Loader2 className="animate-spin mr-2" /> : <FileCheck className="mr-2" />}
                        {isUploading ? 'Uploading...' : 'Upload Circular'}
                    </button>
                </div>
            </form>
            {/* Feedback Messages */}
            {uploadError && <p className="text-red-500 text-sm mt-4 text-center font-semibold">{uploadError}</p>}
            {uploadSuccess && <p className="text-green-600 font-semibold text-sm mt-4 text-center">{uploadSuccess}</p>}
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Circulars</h1>

            {isAdmin && <AdminUploadSection />}

            {/* --- CIRCULARS TABLE --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Notice Board</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="4" className="text-center py-4 text-red-500">{error}</td></tr>
                            ) : circulars?.length > 0 ? (
                                circulars.map((circular, index) => (
                                    <tr key={circular._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{circular.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(circular.uploadDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Note: I've changed circular.circularURL to circular.pdfUrl to match the backend schema from previous answers */}
                                            <button onClick={() => openModal(circular.circularURL)} className="text-indigo-600 cursor-pointer hover:text-indigo-900 font-semibold">View</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-4 text-gray-500">No circulars found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- VIEW MODAL --- */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="flex justify-end">
                            <button onClick={() => setModalOpen(false)} className="text-2xl font-bold text-gray-600 hover:text-gray-900">&times;</button>
                        </div>
                        <div className="mt-2">
                            {selectedCircularUrl.endsWith('.pdf') ? (
                                <embed src={selectedCircularUrl} type="application/pdf" className="w-full h-[75vh]" />
                            ) : (
                                <img src={selectedCircularUrl} alt="Circular" className="max-w-full max-h-[75vh] mx-auto" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CircularsPage;