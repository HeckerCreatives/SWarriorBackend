const TransferService = require("../services/TransferService");
const jwt = require("jsonwebtoken");

exports.transferCredit = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await TransferService.transferCredit(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentTransferPoints = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await TransferService.agentTransferPoints(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getTransferHistories = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await TransferService.getTransferHistories(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentGetTransferHistories = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await TransferService.agentGetTransferHistories(
      token,
      limit,
      page
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getTransferHistoriesById = async (req, res, next) => {
  try {
    const agentId = req.params.agentId;
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await TransferService.getTransferHistoriesById(
      agentId,
      limit,
      page
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
