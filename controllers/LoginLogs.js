const LoginLogService = require("../services/LoginLogService");
const jwt = require("jsonwebtoken");

exports.getLoginLogs = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await LoginLogService.getLoginLogs(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCreditCashoutLogs = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "credit";
    const result = await LoginLogService.getCashoutLogsByType(
      limit,
      page,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCommissionCashoutLogs = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "commission";
    const result = await LoginLogService.getCashoutLogsByType(
      limit,
      page,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentGetCreditCashoutLogs = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "credit";
    const result = await LoginLogService.getCashoutLogsByTypeAndUserId(
      limit,
      page,
      type,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentGetCommissionCashoutLogs = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "commission";
    const result = await LoginLogService.getCashoutLogsByTypeAndUserId(
      limit,
      page,
      type,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
