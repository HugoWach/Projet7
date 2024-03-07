/* Import des modules necessaires */
const multer = require("multer");

// type d'image
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/avif": "avif",
    "image/webp": "webp",
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const originalName = file.originalname;

        const extension = MIME_TYPES[file.mimetype];

        if (!extension) {
            return callback(new Error("Unsupported file type"));
        }

        const finalFileName = `${Date.now()}.${extension}`;
        callback(null, finalFileName);
    },
});

module.exports = multer({ storage: storage }).single("image");
