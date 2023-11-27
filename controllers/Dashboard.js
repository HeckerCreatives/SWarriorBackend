const DashboardService = require("../services/DashboardService");

exports.getAllAgentsCommissions = async (req, res, next) => {
  try {
    const result = await DashboardService.getAllTotalByTypeAndUser(
      "commission",
      "agent"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllPlayersCredits = async (req, res, next) => {
  try {
    const result = await DashboardService.getAllTotalByTypeAndUser(
      "credit",
      "player"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllAgentsCredits = async (req, res, next) => {
  try {
    const result = await DashboardService.getAllTotalByTypeAndUser(
      "credit",
      "agent"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllConvertedCommissions = async (req, res, next) => {
  try {
    const result = await DashboardService.getAllConvertedCommissions();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOtherStats = async (req, res, next) => {
  try {
    const result = await DashboardService.getOtherStats();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyCommission = async (req, res, next) => {
  try {
    const result = await DashboardService.getCompanyCommission();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getRegularEarnings = async (req, res, next) => {
  try {
    const result = await DashboardService.getRegularEarnings();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
