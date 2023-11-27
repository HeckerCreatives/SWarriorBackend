const { default: mongoose } = require("mongoose");
const UserWallet = require("../models/UserWallet");
const Cashout = require("../models/Cashout");
const Account = require("../models/Account");
const TransferHistory = require("../models/TransferHistory");
const CustomError = require("../utils/custom-error");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.getAllTotalByTypeAndUser = async (type, account) => {
  try {
    let matches = {};

    if (account === "player") {
      matches = {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d7"),
        },
      };
    }

    if (account === "agent") {
      matches = {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d7"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8d0"),
            ],
          },
        },
      };
    }

    const commissions = await UserWallet.aggregate([
      {
        $lookup: {
          from: "accounts",
          localField: "owner",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $match: {
          type: type,
        },
      },
      {
        $project: {
          amount: 1,
          type: 1,
          account: { $arrayElemAt: ["$account", 0] },
        },
      },
      {
        $project: {
          amount: 1,
          type: 1,
          roleId: "$account.roleId",
        },
      },
      {
        ...matches,
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const total = commissions.length === 0 ? 0 : commissions[0].total;

    return {
      success: true,
      total: total,
    };
  } catch (error) {
    console.log("GET_ALL_AGENTS_COMMISSIONS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getAllConvertedCommissions = async () => {
  try {
    const converteds = await Cashout.aggregate([
      {
        $match: {
          walletType: "commission",
          status: "done",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const total = converteds.length === 0 ? 0 : converteds[0].total;

    return {
      success: true,
      total,
    };
  } catch (error) {
    console.log("GET_ALL_CONVERTED_COMMISSIONS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getOtherStats = async () => {
  try {
    const systemPointsPromise = UserWallet.aggregate([
      {
        $lookup: {
          from: "accounts",
          localField: "owner",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $project: {
          amount: 1,
          account: { $arrayElemAt: ["$account", 0] },
        },
      },
      {
        $match: {
          "account.roleId": { $ne: mongooseId("655c087a40f8fdd3e086e8cf") },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const activePlayersPromise = Account.countDocuments({
      roleId: "655c087a40f8fdd3e086e8d7",
      status: "approved",
    }).exec();

    const activeAgentsPromise = Account.countDocuments({
      status: "approved",
      roleId: {
        $in: [
          "655c087a40f8fdd3e086e8d3",
          "655c087a40f8fdd3e086e8d6",
          "655c087a40f8fdd3e086e8d4",
          "655c087a40f8fdd3e086e8d5",
        ],
      },
    }).exec();

    const cashinsPromise = TransferHistory.aggregate([
      {
        $lookup: {
          from: "accounts",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $project: {
          action: "transfer",
          sender: { $arrayElemAt: ["$sender", 0] },
          amount: 1,
        },
      },
      {
        $match: {
          "sender.roleId": {
            $in: [
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const cashoutsPromise = Cashout.aggregate([
      {
        $match: {
          status: "done",
          walletType: "credit",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const blockedUsersPromise = Account.countDocuments({
      status: "blocked",
    }).exec();

    const [
      systemPoints,
      activePlayers,
      activeAgents,
      cashins,
      cashouts,
      blockedUsers,
    ] = await Promise.all([
      systemPointsPromise,
      activePlayersPromise,
      activeAgentsPromise,
      cashinsPromise,
      cashoutsPromise,
      blockedUsersPromise,
    ]);

    return {
      success: true,
      systemPoints: systemPoints.length === 0 ? 0 : systemPoints[0].total,
      activePlayers,
      activeAgents,
      blockedUsers,
      cashins: cashins.length === 0 ? 0 : cashins[0].total,
      cashouts: cashouts.length === 0 ? 0 : cashouts[0].total,
    };
  } catch (error) {
    console.log("GET_OTHER_STATS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCompanyCommission = async () => {
  try {
    const wallet = await UserWallet.findOne({
      _id: "65640f774c6a1f5621312fdb",
    }).exec();

    return {
      success: true,
      companyCommission: wallet.amount,
    };
  } catch (error) {
    console.log("GET_COMPANY_COMMISSION", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getRegularEarnings = async () => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date(currentMonth);
    currentMonthEnd.setMonth(currentMonth.getMonth() + 1);
    currentMonthEnd.setMilliseconds(currentMonthEnd.getMilliseconds() - 1);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date(lastMonth);
    lastMonthEnd.setMonth(lastMonth.getMonth() + 1);
    lastMonthEnd.setMilliseconds(lastMonthEnd.getMilliseconds() - 1);

    const currentMonthPromise = TransferHistory.aggregate([
      {
        $match: {
          action: "transfer",
          createdAt: {
            $gte: currentMonth,
            $lte: currentMonthEnd,
          },
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "receiver",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $project: {
          amount: 1,
          sender: { $arrayElemAt: ["$sender", 0] },
          receiver: {
            $arrayElemAt: ["$receiver", 0],
          },
        },
      },
      {
        $match: {
          "sender.roleId": {
            $in: [
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
          "receiver.roleId": {
            $ne: mongooseId("655c087a40f8fdd3e086e8d2"),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const lastMonthPromise = TransferHistory.aggregate([
      {
        $match: {
          action: "transfer",
          createdAt: {
            $gte: lastMonth,
            $lte: lastMonthEnd,
          },
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "receiver",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $project: {
          amount: 1,
          sender: { $arrayElemAt: ["$sender", 0] },
          receiver: {
            $arrayElemAt: ["$receiver", 0],
          },
        },
      },
      {
        $match: {
          "sender.roleId": {
            $in: [
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
          "receiver.roleId": {
            $ne: mongooseId("655c087a40f8fdd3e086e8d2"),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]).exec();

    const [currentMonthEarnings, lastMonthEarnings] = await Promise.all([
      currentMonthPromise,
      lastMonthPromise,
    ]);

    return {
      success: true,
      currentMonth:
        currentMonthEarnings.length === 0 ? 0 : currentMonthEarnings[0].total,
      lastMonth:
        lastMonthEarnings.length === 0 ? 0 : lastMonthEarnings[0].total,
    };
  } catch (error) {
    console.log("GET_REGULAR_EARNINGS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
