
const cloudinary = require('../config/cloudinary'); // Cloudinary configuration
const Circular = require('../models/circularSchema'); // Mongoose model for storing media info
const bufferToStream = require('../utils/bufferToStream');

// Upload media file to Cloudinary and store info in MongoDB 
// Accepts file in req.file (from Multer) and metadata in req.body.
const uploadCircular =  async (req, res) => {

    try {

        const file = req.file; 
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const { title, description } = req.body;
        if(!(title || description)) {
            return res.status(400).json({ message: "Please enter title and description both are mandatory. "});
        }
        // Upload to Cloudinary
        const fileBuffer = req.file.buffer;
        const fileStream = bufferToStream(fileBuffer);
        const uploadOptions = {
            folder: 'Hostel_Management/Circulars', // Optional: Folder in Cloudinary
            resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'auto', // Auto-detect or specify
        };
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }); 
            fileStream.pipe(uploadStream);
        });

        // Store in MongoDB
        const newMedia = new Circular({ public_id: result.public_id, circularURL: result.secure_url, title, description});
        await newMedia.save();

        res.status(200).json({ message: 'File uploaded successfully!', circularURL: result.secure_url, public_id: result.public_id, }); 
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Error uploading file to Cloudinary.', error: error.message });
    }
}

// Get all media files from MongoDB 
const getAllCirculars = async (req, res) => {
    try {
        const mediaFiles = await Circular.find().sort({ createdAt: -1 }); // Sort by newest first 
        // console.log("MediaFiles: ",mediaFiles);
        if(mediaFiles.length === 0){
            return res.status(404).json({ message: 'No media files found.' });
        }

        res.status(200).json(mediaFiles);
    } catch (error) {
        console.error('Error fetching media files:', error);
        res.status(500).json({ message: 'Error fetching media files.', error: error.message });
    }
};

// Delete media file from Cloudinary and MongoDB by ID
const deleteCircularById = async (req, res) => {

    const  media_id  = req.params._id; // Get media_id from URL params
    if (!media_id) {
        return res.status(400).json({ message: 'Media ID is required.' });
    }

    // Find the media item in the database to get its public_id
    const mediaItem = await Circular.findById(media_id);
    if (!mediaItem) {
        return res.status(404).json({ message: 'Media item not found in database.' });
    }

    // Now we have the public_id, proceed to delete
    const public_id = mediaItem.public_id;
    if (!public_id) {
        return res.status(400).json({ message: 'public_id is required.' });
    }

    try 
    {
        // Delete from Cloudinary
        const cloudinaryResult = await cloudinary.uploader.destroy(public_id, {  resource_type: mediaItem.resource_type === 'video' ? 'video' : 'image' });
        if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
            return res.status(500).json({ message: 'Error deleting file from Cloudinary.', error: cloudinaryResult });
        }

        // Delete from MongoDB
        const dbResult = await Circular.findOneAndDelete({ public_id });   
        if (!dbResult) {
            return res.status(404).json({ message: 'Media not found in database.' });
        }
        res.status(200).json({ message: 'Media deleted successfully from Cloudinary and database.' });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ message: 'Error deleting media.', error: error.message });
    }   
};

// Get single media item by ID
const getCircularById = async (req, res) => {  
    try {
        const mediaItem = await Circular.findById(req.params._id);
        if (!mediaItem) {
            return res.status(404).json({ message: 'Media item not found.' });
        }   
        res.status(200).json(mediaItem);
    } catch (error) {   
        console.error('Error fetching single media item:', error);
        res.status(500).json({ message: 'Error fetching media item.' });
    }   
};

// Update media item metadata by ID
const updateCircularById = async (req, res) => {
    try {
        const mediaId = req.params._id;
        const mediaItem = await Circular.findById(mediaId);
        if (!mediaItem) return res.status(404).json({ message: 'Media item not found.' });

        // If a file is provided, upload new to Cloudinary and delete old resource
        if (req.file) {
            const fileBuffer = req.file.buffer;
            const fileStream = bufferToStream(fileBuffer);
            const uploadOptions = {
                folder: 'Hostel_Management/circulars',
                resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'auto',
            };

            // Upload new file
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                fileStream.pipe(uploadStream);
            });

            // Attempt to delete old file from Cloudinary (best-effort)
            try {
                if (mediaItem.public_id) {
                    await cloudinary.uploader.destroy(mediaItem.public_id, { resource_type: mediaItem.resource_type === 'video' ? 'video' : 'image' });
                }
            } catch (delErr) {
                console.warn('Failed to delete previous cloudinary asset:', delErr);
            }

            // Update DB fields with new Cloudinary result
            mediaItem.public_id = result.public_id;
            mediaItem.circularURL = result.secure_url;
        }

        // Allow updating other metadata (e.g., caption) via body
        if (req.body && typeof req.body === 'object') {
            if (req.body.caption !== undefined) mediaItem.caption = req.body.caption;
        }

        await mediaItem.save();
        res.status(200).json(mediaItem);
    } catch (error) {
        console.error('Error updating media item:', error);
        res.status(500).json({ message: 'Error updating media item.', error: error.message });
    }
};

module.exports = { uploadCircular, getAllCirculars, deleteCircularById, getCircularById, updateCircularById };


