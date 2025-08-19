import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import env from "dotenv";
env.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    console.log("Uploading file type:", file.mimetype);

    const ext = file.originalname.split(".").pop();
    const name = file.originalname.replace(/\.[^/.]+$/, ""); // filename without extension

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
    } else if (file.mimetype === "application/pdf") {
      console.log("Treating as PDF");
      return {
        folder: "my_project_pdfs",
        resource_type: "auto",
        public_id: name, // no extension here so Cloudinary doesn’t block it
        format: "pdf", // ensures extension in URL
      };
    } else {
      console.log("Treating as raw");

      // Add timestamp or a random string to make it unique
      const uniqueId = `${name}_${Date.now()}.${ext}`;

      return {
        folder: "my_project_files",
        resource_type: "raw",
        public_id: uniqueId, // now unique per upload
      };
    }
  },
});

const experienceStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    console.log("Uploading file type:", file.mimetype);

    const ext = file.originalname.split(".").pop();
    const name = file.originalname.replace(/\.[^/.]+$/, ""); // filename without extension

    if (file.mimetype.startsWith("image/")) {
      console.log("Treating as image");
      return {
        folder: "experience_images",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        resource_type: "image",
      };
    } else if (file.mimetype.startsWith("video/")) {
      console.log("Treating as video");
      return {
        folder: "experience_videos",
        allowed_formats: ["mp4", "mov", "avi", "webm"],
        resource_type: "video",
      };
    } else if (file.mimetype === "application/pdf") {
      console.log("Treating as PDF");
      return {
        folder: "experiences_pdfs",
        resource_type: "auto",
        public_id: name,
        format: "pdf",
      };
    } else {
      console.log("Treating as raw");
      const uniqueId = `${name}_${Date.now()}.${ext}`;

      return {
        folder: "experiences_files",
        resource_type: "raw",
        public_id: uniqueId,
      };
    }
  },
});

// console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API key:", process.env.CLOUDINARY_KEY);
// console.log("API secret:", process.env.CLOUDINARY_SECRET);

export { cloudinary, projectStorage, experienceStorage };
