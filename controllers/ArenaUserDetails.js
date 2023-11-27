const ArenaUserDetailService = require("../services/ArenaUserDetailService");
const jwt = require("jsonwebtoken");

exports.updateCommissionRate = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const result = await ArenaUserDetailService.updateCommissionRate(
      req.body,
      token
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
