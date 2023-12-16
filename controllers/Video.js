const VideoService = require("../services/VideoService");

exports.getVideos = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await VideoService.getVideos(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createVideo = async (req, res, next) => {
  try {
    const name = req.body.name;
    const url = req.body.url;
    const result = await VideoService.createVideo(name, url);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const videoId = req.body.videoId;
    const name = req.body.name;
    const url = req.body.url;
    const result = await VideoService.updateVideo(videoId, name, url);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const result = await VideoService.deleteVideo(videoId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
