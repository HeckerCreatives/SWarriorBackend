const UserService = require("../services/UserService");
const jwt = require("jsonwebtoken");

exports.getProfile = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await UserService.getProfile(token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getReferrer = async (req, res, next) => {
  try {
    const result = await UserService.getReferrer(req.params.userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createAuthoritative = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await UserService.createAuthoritative(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await UserService.updatePaymentMethod(req.body, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createAgentPlayer = async (req, res, next) => {
  try {
    const result = await UserService.createAgentPlayer(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSenders = async (req, res, next) => {
  try {
    const filter = req.params.filter;
    const result = await UserService.getUsersSender(filter);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getReceivers = async (req, res, next) => {
  try {
    const filter = req.params.filter;
    const result = await UserService.getUsersReceiver(filter);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOwnedCreditPoints = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await UserService.getOwnedPointsByType(token._id, "credit");
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOwnedCommissionpoints = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await UserService.getOwnedPointsByType(
      token._id,
      "commission"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.csrGetReceivers = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const filter = req.params.filter;
    const result = await UserService.csrGetReceivers(filter, token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.agentGetReceivers = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const filter = req.params.filter;
    const result = await UserService.agentGetReceivers(filter, token._id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getFinancers = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d3";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRole(roleId, limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchFinancers = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d3";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRole(
      roleId,
      limit,
      page,
      filter
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSubs = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d6";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRole(roleId, limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchSubs = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d6";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRole(
      roleId,
      limit,
      page,
      filter
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getMasters = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d4";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRole(roleId, limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchMasters = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d4";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRole(
      roleId,
      limit,
      page,
      filter
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getGolds = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d5";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRole(roleId, limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchGolds = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d5";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRole(
      roleId,
      limit,
      page,
      filter
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCsrs = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d2";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRole(roleId, limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchCsrs = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d2";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRole(
      roleId,
      limit,
      page,
      filter
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPlayers = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d7";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRole(roleId, limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchPlayers = async (req, res, next) => {
  try {
    const roleId = "655c087a40f8fdd3e086e8d7";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRole(
      roleId,
      limit,
      page,
      filter
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getModerators = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getModerators(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchModerators = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;
    const result = await UserService.searchModerators(limit, page, filter);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getAccountants = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAccountants(limit, page);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchAccountants = async (req, res, next) => {
  try {
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;
    const result = await UserService.searchAccountants(limit, page, filter);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSubsByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const roleId = "655c087a40f8fdd3e086e8d6";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRoleAndUserId(
      roleId,
      limit,
      page,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchSubsByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const roleId = "655c087a40f8fdd3e086e8d6";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRoleUserId(
      roleId,
      limit,
      page,
      filter,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getMastersByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const roleId = "655c087a40f8fdd3e086e8d4";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRoleAndUserId(
      roleId,
      limit,
      page,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchMastersByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const roleId = "655c087a40f8fdd3e086e8d4";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRoleUserId(
      roleId,
      limit,
      page,
      filter,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getGoldsByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const roleId = "655c087a40f8fdd3e086e8d5";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getAgentsByRoleAndUserId(
      roleId,
      limit,
      page,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.searchGoldByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const roleId = "655c087a40f8fdd3e086e8d5";
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const filter = req.params.filter;

    const result = await UserService.searchAgentsByRoleUserId(
      roleId,
      limit,
      page,
      filter,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getActivePlayerByUserId = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getActivePlayersByUserId(
      limit,
      page,
      token._id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPendingUsersById = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getPendingApprovalsByStatusUserId(
      limit,
      page,
      token._id,
      "pending"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getBannedUsersById = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const limit = isNaN(req.params?.limit) ? 10 : +req.params?.limit;
    const page = isNaN(req.params?.page) ? 1 : +req.params?.page;
    const result = await UserService.getPendingApprovalsByStatusUserId(
      limit,
      page,
      token._id,
      "blocked"
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const userId = req.body.userId;
    const result = await UserService.banUser(userId, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const userId = req.body.userId;
    const result = await UserService.unbanUser(userId, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.approvePlayer = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const userId = req.body.userId;
    const result = await UserService.approvePlayer(userId, token);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.approveAgent = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const userId = req.body.userId;
    const commsRate = req.body.commsRate;
    const result = await UserService.approveAgent(userId, token, commsRate);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
