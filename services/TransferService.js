const UserWallet = require("../models/UserWallet");
const Account = require("../models/Account");
const TransferHistory = require("../models/TransferHistory");

const CustomError = require("../utils/custom-error");
const { isIdValid } = require("../utils/check-id");
const { suTransferisValid } = require("../validators/SuTransferValidate");
const { agentTransferisValid } = require("../validators/AgentTransferValidate");
const UserDetail = require("../models/UserDetail");

exports.transferCredit = async (data, token) => {
  try {
    const validate = suTransferisValid(data);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    if (!isIdValid(data.senderId))
      throw new CustomError("Invalid Sender.", 400);

    if (!isIdValid(data.receiverId))
      throw new CustomError("Invalid Receiver.", 400);

    const senderPromise = Account.findOne({ _id: data.senderId }).exec();
    const receiverPromise = Account.findOne({ _id: data.receiverId }).exec();

    const [sender, receiver] = await Promise.all([
      senderPromise,
      receiverPromise,
    ]);

    if (!sender || sender.username !== data.sender)
      throw new CustomError("Invalid Sender.", 400);

    if (!receiver || receiver.username !== data.receiver)
      throw new CustomError("Invalid Receiver.", 400);

    const senderWalletPromise = UserWallet.findOne({
      type: "credit",
      owner: sender._id,
    }).exec();

    const receiverWalletPromise = UserWallet.findOne({
      type: "credit",
      owner: receiver._id,
    }).exec();

    const [senderWallet, receiverWallet] = await Promise.all([
      senderWalletPromise,
      receiverWalletPromise,
    ]);

    if (senderWallet.amount < data.amount)
      throw new CustomError("Sender have insufficient balance.", 400);

    receiverWallet.amount += +data.amount;
    receiverWallet.markModified("amount");
    receiverWallet.save();

    senderWallet.amount -= +data.amount;
    senderWallet.markModified("amount");
    senderWallet.save();

    await new TransferHistory({
      action: "transfer",
      by: token._id,
      sender: sender._id,
      receiver: receiver._id,
      amount: data.amount,
    }).save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("TRANSFER_CREDIT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.agentTransferPoints = async (data, token) => {
  try {
    const validate = agentTransferisValid(data);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    if (!isIdValid(data.receiverId))
      throw new CustomError("Invalid Receiver.", 400);

    if (token.roleName !== "CSR") {
      const details = await UserDetail.findOne({
        owner: data.receiverId,
      }).exec();
      if (!details.referrer.equals(token._id)) {
        throw new CustomError("Invalid receiver", 400);
      }
    }

    const senderPromise = Account.findOne({ _id: token._id }).exec();
    const receiverPromise = Account.findOne({ _id: data.receiverId }).exec();

    const [sender, receiver] = await Promise.all([
      senderPromise,
      receiverPromise,
    ]);

    if (!receiver || receiver.username !== data.receiver)
      throw new CustomError("Invalid Receiver.", 400);

    const senderWalletPromise = UserWallet.findOne({
      type: "credit",
      owner: sender._id,
    }).exec();

    const receiverWalletPromise = UserWallet.findOne({
      type: "credit",
      owner: receiver._id,
    }).exec();

    const [senderWallet, receiverWallet] = await Promise.all([
      senderWalletPromise,
      receiverWalletPromise,
    ]);

    if (senderWallet.amount < data.amount)
      throw new CustomError("Sender have insufficient balance.", 400);

    receiverWallet.amount += +data.amount;
    receiverWallet.markModified("amount");
    receiverWallet.save();

    senderWallet.amount -= +data.amount;
    senderWallet.markModified("amount");
    senderWallet.save();

    await new TransferHistory({
      action: "transfer",
      by: token._id,
      sender: sender._id,
      receiver: receiver._id,
      amount: data.amount,
    }).save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("AGENT_TRANSFER_POINTS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getTransferHistories = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;

    const countPromise = TransferHistory.countDocuments({});
    const historyPromise = TransferHistory.find({})
      .populate("by", "username -_id")
      .populate("sender", "username -_id")
      .populate("receiver", "username -_id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, histories] = await Promise.all([
      countPromise,
      historyPromise,
    ]);

    const hasNextPage = await TransferHistory.exists().skip(offset + limit);
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
    console.log("GET_TRANSFER_HISTORIES", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.agentGetTransferHistories = async (token, limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = TransferHistory.countDocuments({ by: token._id });
    const historyPromise = TransferHistory.find({ by: token._id })
      .populate("by", "username -_id")
      .populate("sender", "username -_id")
      .populate("receiver", "username -_id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, histories] = await Promise.all([
      countPromise,
      historyPromise,
    ]);

    const hasNextPage = await TransferHistory.exists({ by: token._id }).skip(
      offset + limit
    );
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
    console.log("AGENT_GET_TRANSFER_HISTORIES", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getTransferHistoriesById = async (agentId, limit, page) => {
  try {
    if (!isIdValid(agentId)) throw new CustomError("Invalid Agent.", 400);
    const agent = await Account.findOne({ _id: agentId }).exec();
    if (!agent) throw new CustomError("Invalid Agent.", 400);

    const offset = (+page - 1) * limit;
    const countPromise = TransferHistory.countDocuments({ by: agentId });
    const historyPromise = TransferHistory.find({ by: agentId })
      .populate("by", "username -_id")
      .populate("sender", "username -_id")
      .populate("receiver", "username -_id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, histories] = await Promise.all([
      countPromise,
      historyPromise,
    ]);

    const hasNextPage = await TransferHistory.exists({ by: agentId }).skip(
      offset + limit
    );
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
    console.log("AGENT_GET_TRANSFER_HISTORIES", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
