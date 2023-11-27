const CashoutService = require("../services/CashoutService");
const jwt = require("jsonwebtoken");

exports.requestCreditCashout = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const amount = req.body.amount;
    const type = "credit";
    const result = await CashoutService.requestCashoutByType(
      token._id,
      amount,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.requestCommissionCashout = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const amount = req.body.amount;
    const type = "commission";
    const result = await CashoutService.requestCashoutByType(
      token._id,
      amount,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOwnCreditRequest = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "credit";
    const result = await CashoutService.getOwnCashoutHistoryByTypeAndId(
      limit,
      page,
      token._id,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOwnCommissionRequest = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "commission";
    const result = await CashoutService.getOwnCashoutHistoryByTypeAndId(
      limit,
      page,
      token._id,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllPendingCreditCashout = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "credit";
    const result = await CashoutService.getAllPendingCashoutByType(
      limit,
      page,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllPendingCommissionCashout = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "commission";
    const result = await CashoutService.getAllPendingCashoutByType(
      limit,
      page,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAllPendingCreditCashoutByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "credit";
    const result = await CashoutService.getAllPendingCashoutByTypeAndUserId(
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

exports.getAllPendingCommissionCashoutByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const type = "commission";
    const result = await CashoutService.getAllPendingCashoutByTypeAndUserId(
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

exports.adminApproveCashout = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const cashoutId = req.body.cashoutId;
    const type = "done";
    const result = await CashoutService.adminCashoutChangeStatus(
      cashoutId,
      token._id,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.adminRejectCashout = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const cashoutId = req.body.cashoutId;
    const type = "reject";
    const result = await CashoutService.adminCashoutChangeStatus(
      cashoutId,
      token._id,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentApproveCashout = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const cashoutId = req.body.cashoutId;
    const type = "done";
    const result = await CashoutService.adminCashoutChangeStatus(
      cashoutId,
      token._id,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentRejectCashout = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const cashoutId = req.body.cashoutId;
    const type = "reject";
    const result = await CashoutService.adminCashoutChangeStatus(
      cashoutId,
      token._id,
      type
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
