const BetService = require("../services/BetService");
const jwt = require("jsonwebtoken");

exports.betMeron = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const amount = req.body.amount;
    const arenaId = req.body.arenaId;
    const bet = "meron";
    const result = await BetService.betByType(arenaId, bet, amount, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.betWala = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const amount = req.body.amount;
    const arenaId = req.body.arenaId;
    const bet = "wala";
    const result = await BetService.betByType(arenaId, bet, amount, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.betDraw = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const amount = req.body.amount;
    const arenaId = req.body.arenaId;
    const bet = "draw";
    const result = await BetService.betByType(arenaId, bet, amount, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentBet = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const arenaId = req.params.arenaId;
    const result = await BetService.getCurrentBet(arenaId, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.adminGetBets = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await BetService.adminGetBets(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getBetByArenaIdAndUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const arenaId = req.params.arenaId;
    const result = await BetService.getBetByArenaIdAndUserId(
      token._id,
      arenaId
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getUnprocessedBets = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await BetService.getUnprocessedBets(limit, page, token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.processUnprocessedBets = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await BetService.processUnprocessedBets(token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
