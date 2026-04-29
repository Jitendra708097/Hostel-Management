// middleware/upload.js
const multer = require('multer');

// Configure Multer to store files in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit (adjust as needed)
    fileFilter: (req, file, cb) => {
        // Basic file type validation (optional but recommended)
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
        }
    }
});

const circularUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isAllowed =
            file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/') ||
            file.mimetype === 'application/pdf';

        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'), false);
        }
    }
});

const grievanceUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isAllowed =
            file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/') ||
            file.mimetype === 'application/pdf';

        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and PDFs are allowed.'), false);
        }
    }
});

upload.circular = circularUpload;
upload.grievance = grievanceUpload;

module.exports = upload;
