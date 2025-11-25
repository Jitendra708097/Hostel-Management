// middleware/upload.js
const multer = require('multer');

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
// console.log("Hello");

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit (adjust as needed)
    fileFilter: (req, file, cb) => {
        console.log("File", file)
        // Basic file type validation (optional but recommended)
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
        }
    }
});

module.exports = upload;