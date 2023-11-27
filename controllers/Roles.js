const RoleService = require("../services/RoleService");

exports.getRoles = async (req, res, next) => {
  try {
    const result = await RoleService.getRoles();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
