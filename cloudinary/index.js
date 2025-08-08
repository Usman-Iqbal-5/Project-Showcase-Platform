import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import env from "dotenv";
env.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    console.log("Uploading file type:", file.mimetype);

    if (file.mimetype.startsWith("image/")) {
      console.log("Treating as image");
      return {
        folder: "my_project_images",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        resource_type: "image",
      };
    } else if (file.mimetype.startsWith("video/")) {
      console.log("Treating as video");
      return {
        folder: "my_project_videos",
        allowed_formats: ["mp4", "mov", "avi", "webm"],
        resource_type: "video",
      };
    } else {
      console.log("Treating as raw");
      return {
        folder: "my_project_files",
        allowed_formats: ["pdf", "doc", "docx", "txt"],
        resource_type: "raw",
      };
    }
  },
});

console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_KEY);
console.log("API secret:", process.env.CLOUDINARY_SECRET);

export { cloudinary, storage };
