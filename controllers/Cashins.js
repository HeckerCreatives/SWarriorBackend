const CashinService = require("../services/CashinService");
const jwt = require("jsonwebtoken");

exports.adminCashin = async (req, res, next) => {
  try {
    const token = jwt.decode(req.headers["authorization"].split(" ")[1]);
    const amount = req.body.amount;
    const result = await CashinService.adminCashin(token, amount);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
