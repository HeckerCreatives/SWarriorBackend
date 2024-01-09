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

exports.getArenasForCommissions = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await ArenaService.getArenasForCommissions(limit, page);
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
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const arenaId = req.params.arenaId;
    const result = await ArenaService.deleteArena(arenaId, token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getArenaById = async (req, res, next) => {
  try {
    const arenaId = req.params.arenaId;
    const result = await ArenaService.getArenaById(arenaId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.controlArena = async (req, res, next) => {
  try {
    const arenaId = req.params.arenaId;
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await ArenaService.controlArena(arenaId, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.arenaOpenBetting = async (req, res, next) => {
  try {
    const arenaId = req.body.arenaId;
    const result = await ArenaService.changeArenaBettingStatus(arenaId, "open");
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.arenaCloseBetting = async (req, res, next) => {
  try {
    const arenaId = req.body.arenaId;
    const result = await ArenaService.changeArenaBettingStatus(
      arenaId,
      "close"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPreviousOutcome = async (req, res, next) => {
  try {
    const arenaId = req.params.arenaId;
    const result = await ArenaService.getPreviousOutcome(arenaId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.arenaFinishRound = async (req, res, next) => {
  try {
    const arenaId = req.body.arenaId;
    const outcome = req.body.result;
    const result = await ArenaService.arenaFinishRound(arenaId, outcome);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentOutcome = async (req, res, next) => {
  try {
    const arenaId = req.params.arenaId;
    const result = await ArenaService.getCurrentOutcome(arenaId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.giveWinsAndComms = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const arenaId = req.body.arenaId;
    const roundId = req.body.roundId;

    const result = await ArenaService.giveWinsAndComms(
      token._id,
      roundId,
      arenaId
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.arenaNextRound = async (req, res, next) => {
  try {
    const arenaId = req.body.arenaId;
    const result = await ArenaService.arenaNextRound(arenaId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.arenaUpdateRound = async (req, res, next) => {
  try {
    const arenaId = req.body.arenaId;
    const roundNumber = req.body.roundNumber;
    const result = await ArenaService.arenaUpdateRound(arenaId, roundNumber);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
