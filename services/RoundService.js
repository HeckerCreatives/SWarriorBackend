const Round = require("../models/Round");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");

exports.getRoundsByArena = async arenaId => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const rounds = await Round.find({ arenaId, outcome: { $ne: "-" } })
      .sort("-createdAt")
      .exec();

    return {
      success: true,
      rounds,
    };
  } catch (error) {
    console.log("GET_ROUNDS_BY_ARENA", error);
    throw new CustomError(error.message, error.statusCode);
  }
};
