const multer = require("multer");
const path = require("node:path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// Reusable middleware for a specific image field
const createImageUploadHandler = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (error) => {
      if (error) {
        return res.status(400).send(error.message);
      }

      next();
    });
  };
};

// Keep the existing profile-picture upload working
const handleUpload = createImageUploadHandler("profilePicture");

// Add a separate handler for chat images
const handleMessageImage = createImageUploadHandler("image");

// Preserve the existing default export
module.exports = handleUpload;

// Export the new handler as an additional property
module.exports.handleMessageImage = handleMessageImage;