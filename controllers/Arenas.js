const ArenaService = require("../services/ArenaService");
const jwt = require("jsonwebtoken");

exports.getVideos = async (req, res, next) => {
  try {
    const result = await ArenaService.getUnselectedVideos();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getArenas = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await ArenaService.getArenas(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getClosedArenas = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await ArenaService.getClosedArenas(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createArena = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await ArenaService.createArena(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateArena = async (req, res, next) => {
  try {
    const result = await ArenaService.updateArena(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteArena = async (req, res, next) => {
  try {
    const arenaId = req.params.arenaId;
    const result = await ArenaService.deleteArena(arenaId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
