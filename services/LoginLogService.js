const LoginLog = require("../models/LoginLog");
const Cashout = require("../models/Cashout");
const CustomError = require("../utils/custom-error");

exports.getLoginLogs = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = LoginLog.countDocuments({});
    const logPromise = LoginLog.find({})
      .populate("owner", "username active")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, logs] = await Promise.all([countPromise, logPromise]);

    const hasNextPage = await LoginLog.exists({}).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      logs,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_LOGIN_LOGS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCashoutLogsByType = async (limit, page, type) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Cashout.countDocuments({
      status: { $ne: "pending" },
      walletType: type,
    });
    const logPromise = Cashout.find({
      status: { $ne: "pending" },
      walletType: type,
    })
      .populate("owner", "username")
      .populate("agent", "username")
      .populate("processedBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, logs] = await Promise.all([countPromise, logPromise]);

    const hasNextPage = await Cashout.exists({
      status: { $ne: "pending" },
      walletType: type,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      logs,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_CASHOUT_BY_TYPE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCashoutLogsByTypeAndUserId = async (limit, page, type, userId) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Cashout.countDocuments({
      processedBy: userId,
      status: { $ne: "pending" },
      walletType: type,
    });
    const logPromise = Cashout.find({
      processedBy: userId,
      status: { $ne: "pending" },
      walletType: type,
    })
      .populate("owner", "username")
      .populate("agent", "username")
      .populate("processedBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, logs] = await Promise.all([countPromise, logPromise]);

    const hasNextPage = await Cashout.exists({
      processedBy: userId,
      status: { $ne: "pending" },
      walletType: type,
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      logs,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_CASHOUT_BY_TYPE_AND_USERID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
