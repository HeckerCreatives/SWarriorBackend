const RoundService = require("../services/RoundService");

exports.getRoundsByArena = async (req, res, next) => {
  try {
    const arenaId = req.params.arenaId;
    const result = await RoundService.getRoundsByArena(arenaId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
