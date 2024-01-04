const { default: mongoose } = require("mongoose");
const Cashout = require("../models/Cashout");
const UserDetail = require("../models/UserDetail");
const UserWallet = require("../models/UserWallet");
const CustomError = require("../utils/custom-error");
const { isIdValid } = require("../utils/check-id");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.requestCashoutByType = async (userId, amount, type) => {
  try {
    if (isNaN(amount)) throw new CustomError("Invalid Amount", 400);
    if (amount === "") throw new CustomError("Invalid Amount", 400);

    const wallet = await UserWallet.findOne({ owner: userId, type }).exec();
    const requestorDetails = await UserDetail.findOne({ owner: userId }).exec();

    if (!requestorDetails.paymentMode) {
      throw new CustomError(
        "Please update your payment mode before requesting for a cashout",
        400
      );
    }

    if (amount > wallet.amount)
      throw new CustomError("Insufficient Balance", 400);

    const updatedWallet = await UserWallet.findByIdAndUpdate(
      { _id: wallet._id },
      { $inc: { amount: -amount } },
      { new: true }
    ).exec();

    const request = new Cashout({
      owner: userId,
      agent: requestorDetails.referrer,
      walletType: type,
      status: "pending",
      amount: amount,
    });
    await request.save();

    return {
      success: true,
      balance: updatedWallet.amount,
    };
  } catch (error) {
    console.log("REQUEST_CASHOUT_BY_TYPE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getOwnCashoutHistoryByTypeAndId = async (limit, page, userId, type) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Cashout.countDocuments({
      owner: userId,
      walletType: type,
    });
    const historyPromise = Cashout.find(
      { owner: userId, walletType: type },
      {
        status: 1,
        amount: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, histories] = await Promise.all([
      countPromise,
      historyPromise,
    ]);

    const hasNextPage = await Cashout.exists({
      owner: userId,
      walletType: type,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      histories,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_OWN_CASHOUT_HISTORY_BY_TYPE_AND_ID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getAllPendingCashoutByType = async (limit, page, type) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Cashout.countDocuments({
      status: "pending",
      walletType: type,
    });
    const cashoutPromise = Cashout.aggregate([
      {
        $match: {
          status: "pending",
          walletType: type,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "owner",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          walletType: 1,
          status: 1,
          amount: 1,
          createdAt: 1,
          account: {
            _id: 1,
            username: 1,
          },
          details: {
            bankAcctAddDetails: 1,
            bankAcctName: 1,
            bankAcctNumber: 1,
            paymentMode: 1,
          },
        },
      },
      {
        $project: {
          walletType: 1,
          status: 1,
          amount: 1,
          createdAt: 1,
          owner: { $arrayElemAt: ["$account", 0] },
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]).exec();

    const [count, cashouts] = await Promise.all([countPromise, cashoutPromise]);

    const hasNextPage = await Cashout.exists({
      status: "pending",
      walletType: type,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      cashouts,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_ALL_PENDING_CASHOUT_BY_TYPE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getAllPendingCashoutByTypeAndUserId = async (
  limit,
  page,
  type,
  userId
) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Cashout.countDocuments({
      status: "pending",
      agent: userId,
      walletType: type,
    });
    const cashoutPromise = Cashout.aggregate([
      {
        $match: {
          status: "pending",
          agent: mongooseId(userId),
          walletType: type,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "owner",
          foreignField: "_id",
          as: "account",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "owner",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          walletType: 1,
          status: 1,
          amount: 1,
          createdAt: 1,
          account: {
            _id: 1,
            username: 1,
          },
          details: {
            bankAcctAddDetails: 1,
            bankAcctName: 1,
            bankAcctNumber: 1,
            paymentMode: 1,
          },
        },
      },
      {
        $project: {
          walletType: 1,
          status: 1,
          amount: 1,
          createdAt: 1,
          owner: { $arrayElemAt: ["$account", 0] },
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]).exec();

    const [count, cashouts] = await Promise.all([countPromise, cashoutPromise]);

    const hasNextPage = await Cashout.exists({
      status: "pending",
      agent: userId,
      walletType: type,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      cashouts,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_ALL_PENDING_CASHOUT_BY_TYPE_AND_ID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.adminCashoutChangeStatus = async (cashoutId, agentId, status) => {
  try {
    if (!isIdValid(cashoutId)) throw new CustomError("Invalid request", 400);
    const cashout = await Cashout.findOne({
      _id: cashoutId,
      status: "pending",
    }).exec();
    if (!cashout) throw new CustomError("Invalid request", 400);

    const requestorWallet = await UserWallet.findOne({
      owner: cashout.owner,
      type: cashout.walletType,
    }).exec();

    if (status === "reject") {
      UserWallet.updateone(
        { _id: requestorWallet._id },
        { $inc: { amount: cashout.amount } }
      ).exec();
    }

    if (cashout.walletType === "credit") {
      if (status === "done") {
        const acceptorWallet = await UserWallet.findOne({
          owner: agentId,
          type: cashout.walletType,
        }).exec();

        UserWallet.updateone(
          { _id: acceptorWallet._id },
          { $inc: { amount: cashout.amount } }
        ).exec();
      }
    }

    if (cashout.walletType === "commission") {
      if (status === "done") {
        const requestorCreditWallet = await UserWallet.findOne({
          owner: cashout.owner,
          type: "credit",
        }).exec();

        UserWallet.updateone(
          { _id: requestorCreditWallet._id },
          { $inc: { amount: cashout.amount } }
        ).exec();
      }
    }

    cashout.status = status;
    cashout.processedBy = agentId;
    cashout.markModified("status");
    cashout.markModified("processedBy");
    cashout.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("ADMIN_CASHOUT_CHANGE_STATUS", error);
    throw new CustomError(error.message, error, statusCode || 500);
  }
};

exports.agentCashoutChangeStatus = async (cashoutId, agentId, status) => {
  try {
    if (!isIdValid(cashoutId)) throw new CustomError("Invalid request", 400);
    const cashout = await Cashout.findOne({
      _id: cashoutId,
      status: "pending",
    }).exec();
    if (!cashout) throw new CustomError("Invalid request", 400);

    if (!cashout.agent.equals(mongooseId(agentId)))
      throw new CustomError("Invalid agent", 400);

    const requestorWallet = await UserWallet.findOne({
      owner: cashout.owner,
      type: cashout.walletType,
    }).exec();

    if (status === "reject") {
      await UserWallet.updateOne(
        { _id: requestorWallet._id },
        { $inc: { amount: cashout.amount } }
      ).exec();
    }

    if (status === "done") {
      const acceptorWallet = await UserWallet.findOne({
        owner: agentId,
        type: cashout.walletType,
      }).exec();

      await UserWallet.updateOne(
        { _id: acceptorWallet._id },
        { $inc: { amount: cashout.amount } }
      ).exec();
    }

    cashout.status = status;
    cashout.processedBy = agentId;
    cashout.markModified("status");
    cashout.markModified("processedBy");
    cashout.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("ADMIN_CASHOUT_CHANGE_STATUS", error);
    throw new CustomError(error.message, error, statusCode || 500);
  }
};
