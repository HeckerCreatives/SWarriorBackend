const generateToken = require("../config/generateToken");
const passport = require("passport");
const LoginLog = require("../models/LoginLog");
const UserDetail = require("../models/UserDetail");
const AuthService = require("../services/AuthService");

exports.login = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err)
      return res.status(500).json({ success: false, msg: info, data: err });

    if (!user)
      return res.status(401).json({ success: false, msg: info.message });

    if (user.status === "blocked")
      return res.status(401).json({
        success: false,
        msg: "Your account has been banned.",
      });

    if (user.roleId.name !== "Player" && user.status === "pending")
      return res.status(401).json({
        success: false,
        msg: "Your account has not yet been approved.",
      });

    const details = await UserDetail.findOne({ owner: user._id }).exec();

    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;

    new LoginLog({
      owner: user._id,
      event: "login",
      country: details?.country || "N/A",
      ipAddress: ipAddress,
    }).save();

    let token = generateToken(user);
    let rtnData = { success: true, msg: "ok", info: token.access };

    return res.status(200).json(rtnData);
  })(req, res);
};

exports.changeAgentPassword = async (req, res, next) => {
  try {
    const result = await AuthService.changeAgentPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
