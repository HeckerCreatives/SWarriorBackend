const { default: mongoose } = require("mongoose");
const CommissionHistory = require("../models/CommisionHistory");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const Account = require("../models/Account");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.getCommissionHistories = async (limit, page, owner) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = CommissionHistory.countDocuments({ receiver: owner });
    const commissionPromise = CommissionHistory.find({ receiver: owner })
      .populate("round", "-_id roundNumber")
      .populate("arena", "-_id eventName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, commissions] = await Promise.all([
      countPromise,
      commissionPromise,
    ]);

    const hasNextPage = await CommissionHistory.exists({
      receiver: owner,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      commissions,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_COMMISSION_HISTORIES", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCommissionData = async () => {
  try {
    const meronWalaCommsPromise = CommissionHistory.aggregate([
      {
        $lookup: {
          from: "bets",
          localField: "betId",
          foreignField: "_id",
          as: "bet",
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "receiver",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $unwind: {
          path: "$bet",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$account",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "account.roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "role.name": "Superadmin",
        },
      },
      {
        $match: {
          $or: [{ "bet.bet": "meron" }, { "bet.bet": "wala" }],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const drawCommsPromise = CommissionHistory.aggregate([
      {
        $lookup: {
          from: "bets",
          localField: "betId",
          foreignField: "_id",
          as: "bet",
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "receiver",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $unwind: {
          path: "$bet",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$account",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "account.roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: {
          path: "$role",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "role.name": "Superadmin",
        },
      },
      {
        $match: {
          $or: [{ "bet.bet": "draw" }],
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const [meronWalaComms, drawComms] = await Promise.all([
      meronWalaCommsPromise,
      drawCommsPromise,
    ]);

    const meronWala = meronWalaComms.length === 0 ? 0 : meronWalaComms[0].total;
    const draw = drawComms.length === 0 ? 0 : drawComms[0].total;

    return {
      success: true,
      regular: meronWala,
      draw: draw,
      gross: meronWala + draw,
    };
  } catch (error) {
    console.log("GET_COMMISSION_DATA", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCommissionByArenaIdAndUserId = async (
  limit,
  page,
  owner,
  arenaId,
  roleName
) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    let newReceiver;

    if (roleName === "Accountant") {
      const su = await Account.findOne({
        username: process.env.SU_USERNAME,
      }).exec();
      newReceiver = su._id;
    } else {
      newReceiver = owner;
    }

    const offset = (+page - 1) * limit;
    const countPromise = CommissionHistory.countDocuments({
      receiver: newReceiver,
      arena: arenaId,
    });

    const commissionPromise = CommissionHistory.aggregate([
      {
        $match: {
          receiver: mongooseId(newReceiver),
          arena: mongooseId(arenaId),
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "sender",
          foreignField: "_id",
          as: "senderAccount",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "sender",
          foreignField: "owner",
          as: "senderDetails",
        },
      },
      {
        $lookup: {
          from: "arenas",
          localField: "arena",
          foreignField: "_id",
          as: "arenaDetails",
        },
      },
      {
        $lookup: {
          from: "rounds",
          localField: "round",
          foreignField: "_id",
          as: "roundDetails",
        },
      },
      {
        $unwind: "$senderAccount",
      },
      {
        $unwind: "$senderDetails",
      },
      {
        $unwind: "$roundDetails",
      },
      {
        $unwind: "$arenaDetails",
      },
      {
        $lookup: {
          from: "accounts",
          localField: "senderDetails.referrer",
          foreignField: "_id",
          as: "senderReferrer",
        },
      },
      {
        $unwind: "$senderReferrer",
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      { $skip: offset },
      { $limit: limit },
      {
        $project: {
          arena: "$arenaDetails.eventName",
          fights: "$roundDetails.roundNumber",
          commission: "$amount",
          player: "$senderAccount.username",
          agent: "$senderReferrer.username",
          outcome: "$roundDetails.outcome",
          createdAt: "$createdAt",
        },
      },
    ]).exec();

    const [count, commissions] = await Promise.all([
      countPromise,
      commissionPromise,
    ]);

    const hasNextPage = await CommissionHistory.exists({
      receiver: newReceiver,
      arena: arenaId,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      commissions,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_COMMISSION_BY_ARENAID_AND_USERID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
