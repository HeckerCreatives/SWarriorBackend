const AnnouncementService = require("../services/AnnouncementService");
const jwt = require("jsonwebtoken");
exports.getAnnouncements = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await AnnouncementService.getAnnouncements(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createAnnoucement = async (req, res, next) => {
  try {
    const data = req.body;
    const file = req.file;
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await AnnouncementService.createAnnoucement(
      data,
      file,
      token
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const data = req.body;
    const file = req.file;
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await AnnouncementService.updateAnnouncement(
      data,
      file,
      token
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcementId = req.params.id;
    const result = await AnnouncementService.deleteAnnouncement(announcementId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getRecentAnnouncement = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 3 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await AnnouncementService.getRecentAnnouncement(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
