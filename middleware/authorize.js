const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const mongoose = require("mongoose");

exports.isAuthorize = (roles = []) => {
  if (typeof roles === "string") roles = [roles];
  return async (req, res, next) => {
    const token = jwt.decode(req.headers.authorization.split(" ")[1]);

    if (!mongoose.Types.ObjectId.isValid(token._id))
      return res.status(403).json({ msg: "Forbidden" });

    const user = await Account.findById(token._id).populate("roleId").exec();

    if (!user) return res.status(403).json({ msg: "Forbidden" });

    if (!roles.includes(user.roleId.name))
      return res.status(403).json({ msg: "Forbidden" });

    next();
  };
};
