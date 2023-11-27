const UserWalletService = require("../services/UserWalletService");

exports.getTopPoints = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserWalletService.getTopPoints(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getTopCommissions = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserWalletService.getTopCommissions(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
