const Cashin = require("../models/Cashin");
const UserWallet = require("../models/UserWallet");
const CustomError = require("../utils/custom-error");

exports.adminCashin = async (token, amount) => {
  try {
    if (isNaN(amount)) throw new CustomError("Invalid amount", 400);
    if (+amount <= 0) throw new CustomError("Invalid amount", 400);

    const wallet = await UserWallet.findOne({
      owner: token._id,
      type: "credit",
    }).exec();

    if (!wallet) throw new CustomError("Invalid user", 400);

    wallet.amount += +amount;
    wallet.markModified("amount");
    await wallet.save();

    const cashinHistory = new Cashin({
      owner: wallet.owner,
      agent: wallet.owner,
      walletType: "credit",
      status: "done",
      amount: +amount,
      processedBy: wallet.owner,
    });
    await cashinHistory.save();

    return {
      success: true,
      balance: wallet.amount,
    };
  } catch (error) {
    console.log("ADMIN_CASHIN", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
