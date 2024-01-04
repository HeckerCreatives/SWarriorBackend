const jwt = require("jsonwebtoken");
const Arena = require("../models/Arena");
const mongoose = require("mongoose");

exports.isController = async (req, res, next) => {
  const token = jwt.decode(req.headers.authorization.split(" ")[1]);
  const arenaId = req.query.arenaId;

  if (!mongoose.Types.ObjectId.isValid(token._id))
    return res.status(403).json({ msg: "Forbidden" });

  if (!mongoose.Types.ObjectId.isValid(arenaId))
    return res.status(403).json({ msg: "Forbidden" });

  const arena = await Arena.findOne({ _id: arenaId }).exec();
  if (!arena) return res.status(403).json({ msg: "Forbidden" });

  if (!arena.moderator.equals(new mongoose.Types.ObjectId(token._id)))
    return res.status(403).json({ msg: "Forbidden" });

  next();
};
