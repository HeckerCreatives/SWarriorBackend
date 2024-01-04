const CommissionHistoryService = require("../services/CommissionHistoryService");
const jwt = require("jsonwebtoken");

exports.getCommissionHistories = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await CommissionHistoryService.getCommissionHistories(
      limit,
      page,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCommissionData = async (req, res, next) => {
  try {
    const result = await CommissionHistoryService.getCommissionData();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCommissionByArenaIdAndUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const arenaId = req.params.arenaId;
    const result =
      await CommissionHistoryService.getCommissionByArenaIdAndUserId(
        limit,
        page,
        token._id,
        arenaId,
        token.roleName
      );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
