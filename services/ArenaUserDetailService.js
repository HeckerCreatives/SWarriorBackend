const ArenaUserDetail = require("../models/ArenaUserDetail");
const Account = require("../models/Account");
const UserDetail = require("../models/UserDetail");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");

exports.updateCommissionRate = async (data, token) => {
  try {
    if (!isIdValid(data.agentId)) throw new CustomError("Invalid agent", 400);
    if (isNaN(data.commsRate) || data.commsRate > 8 || data.commsRate < 1)
      throw new CustomError("Invalid data", 400);

    const agent = await Account.findOne({ _id: data.agentId }).exec();
    if (!agent) throw new CustomError("Invalid agent", 400);
    if (agent.username !== data.agent)
      throw new CustomError("Invalid agent", 400);

    const arenaUserDetail = await ArenaUserDetail.findOne({
      owner: agent._id,
    }).exec();

    if (!["Superadmin", "CSR"].includes(token.roleName)) {
      const otherArenaUserDetail = await ArenaUserDetail.findOne({
        owner: token._id,
      }).exec();

      if (otherArenaUserDetail.commisionRate <= +data.commsRate)
        throw new CustomError("Invalid Commission Rate", 400);

      const agentDetails = await UserDetail.findOne({
        owner: agent._id,
      }).exec();

      if (!agentDetails.referrer.equals(otherArenaUserDetail.owner))
        throw new CustomError("Invalid Referral", 400);
    }

    arenaUserDetail.commisionRate = +data.commsRate;
    arenaUserDetail.markModified("commisionRate");
    arenaUserDetail.save();

    return {
      success: true,
      agentId: agent._id,
      newRate: arenaUserDetail.commisionRate,
    };
  } catch (error) {
    console.log("UPDATE_COMMISSION_RATE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
