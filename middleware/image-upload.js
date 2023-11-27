const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CustomError = require("../utils/custom-error");
const { allowedFormats } = require("../utils/allowed-formats");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { announcementIsValid } = require("../validators/AnnouncementValidate");

const announcementUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const dest = path.resolve(
      global.rootDir,
      "assets",
      "uploads",
      token._id,
      "announcement"
    );
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const format =
      file.originalname.split(".")[file.originalname.split(".").length - 1];
    cb(null, `${crypto.randomUUID()}.${format}`);
  },
});

const validateFile = (req, file, cb) => {
  const validate = announcementIsValid(req.body);
  if (!validate.isValid) cb(new CustomError(validate.msg, 400));

  if (!file && req.method === "POST")
    cb(new CustomError("Please select an image to upload.", 400));

  const format =
    file.originalname.split(".")[file.originalname.split(".").length - 1];

  if (!allowedFormats.includes(format.toLowerCase())) {
    cb(new CustomError("Invalid image.", 400));
    return;
  }

  cb(null, true);
};

const announcementUpload = multer({
  dest: `/assets/uploads/`,
  storage: announcementUploadStorage,
  fileFilter: validateFile,
}).single("announcementImage");

exports.announcementUploadCheck = (req, res, next) => {
  announcementUpload(req, res, err => {
    if (err instanceof multer.MulterError) {
      next(
        new CustomError(
          err.message || "Failed to upload image.",
          err.statusCode || 500
        )
      );
    } else if (err) {
      next(
        new CustomError(
          err.message || "Failed to upload image.",
          err.statusCode || 500
        )
      );
    }
    next();
  });
};
