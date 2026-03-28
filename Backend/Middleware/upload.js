import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../Utils/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "codifyx/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 300, height: 300, crop: "fill", gravity: "face" }
    ],
    public_id: `avatar-${req.user._id}-${Date.now()}`,
  }),
})

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true)
    else cb(new Error("Only image files allowed"), false)
  },
})