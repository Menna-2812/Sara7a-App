import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const fileTypeValidation = {
  images: ["image/png", "image/jpg", "image/jpeg"],
  videos: ["video/mp4", "video/mpeg", "video/jpeg"],
  audios: ["audio/mp4", "audio/3gpp2", "audio/webm"],
  document: ["application/pdf", "application/msword"],
};

export const localFileUpload = ({
  customPath = "general",
  validation = [],
} = {}) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;
      if (req.user?._id) {
        userBasePath += `/${req.user._id}`;
      }
      const fullPath = path.resolve(`./src/${userBasePath}`);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      cb(null, path.resolve(fullPath));
    },

    filename: (req, file, cb) => {
      const uniqueFileName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname;
      file.finalPath = `${basePath}/${req.user?._id}/${uniqueFileName}`;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (validation.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error("Invalid File Type"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
  });
};
