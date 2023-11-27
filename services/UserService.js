const Account = require("../models/Account");
const UserDetail = require("../models/UserDetail");
const Role = require("../models/Role");
const ArenaUserDetail = require("../models/ArenaUserDetail");
const UserWallet = require("../models/UserWallet");

const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const { isUserValid } = require("../validators/UserValidator");
const { isAgentValid } = require("../validators/AgentValidator");
const { default: mongoose } = require("mongoose");
const { isPaymentMethodValid } = require("../validators/PaymentMethodValidate");

const ArenaUserDetailService = require("../services/ArenaUserDetailService");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.getProfile = async userId => {
  try {
    const profile = await Account.aggregate([
      {
        $match: {
          _id: mongooseId(userId),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissionRate",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          role: { name: 1 },
          details: {
            fullName: 1,
            phoneNumber: 1,
            email: 1,
            country: 1,
            bankAcctNumber: 1,
            bankAcctName: 1,
            paymentMode: 1,
            bankAcctAddDetails: 1,
          },
          wallets: {
            _id: 1,
            type: 1,
            amount: 1,
          },
          commissionRate: {
            commisionRate: 1,
            _id: 1,
          },
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          role: { $arrayElemAt: ["$role", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          commissionRate: {
            $arrayElemAt: ["$commissionRate", 0],
          },
        },
      },
    ]).exec();

    return {
      success: true,
      profile: profile[0],
    };
  } catch (error) {
    console.log("GET_PROFILE", error);
    throw new CustomError(error.message, error, statusCode || 500);
  }
};

exports.getReferrer = async userId => {
  try {
    if (!isIdValid(userId)) throw new CustomError("Invalid Referrer.", 400);

    const referrer = await Account.findOne(
      { _id: userId },
      {
        _id: 0,
        username: 1,
      }
    ).exec();

    if (!referrer) throw new CustomError("Invalid Referrer.", 400);

    return {
      success: true,
      referrer: referrer.username,
    };
  } catch (error) {
    console.log("GET_REFERRER", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.createAuthoritative = async (data, token) => {
  try {
    const isDataValid = isUserValid(data);
    if (!isDataValid.isValid) throw new CustomError(isDataValid.msg, 400);

    if (!isIdValid(data.roleId)) throw new CustomError("Invalid Role", 400);
    const role = await Role.findOne({ _id: data.roleId }).exec();

    if (!role) throw new CustomError("Invalid Role", 400);

    const accountExists = await Account.findOne({
      username: data.username,
    }).exec();

    if (accountExists) throw new CustomError("Username already exists.", 400);

    const nonApproval = [
      "CSR",
      "Moderator",
      "Accountant",
      "Superadmin",
      "Financer",
    ];

    const account = new Account({
      username: data.username,
      password: data.password,
      status: nonApproval.includes(role.name) ? "approved" : "pending",
      active: false,
      roleId: role._id,
    });
    account.savePassword(data.password);
    await account.save();

    const details = new UserDetail({
      owner: account._id,
      fullname: data.fullname,
      phoneNumber: data.phonenumber,
      email: data.email,
      referrer: token._id,
      pin: data.pin,
    });
    await details.save();

    if (role.name === "Financer") {
      const arenaUserDetail = new ArenaUserDetail({
        owner: account._id,
        commisionRate: data.commisionrate,
      });
      await arenaUserDetail.save();

      await UserWallet.insertMany([
        { owner: account._id, type: "commission" },
        { owner: account._id, type: "credit" },
      ]);
    }

    if (role.name === "CSR") {
      await new UserWallet({
        owner: account._id,
        type: "credit",
      }).save();
    }

    return {
      success: true,
    };
  } catch (error) {
    console.log("CREATE_AUTHORITATIVE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.createAgentPlayer = async data => {
  try {
    const types = ["player", "agent"];
    const referrers = ["Financer", "Sub", "Master", "Gold"];

    const type = Buffer.from(data.type, "base64").toString();
    if (!types.includes(type)) throw new CustomError("Invalid data.", 400);

    const isDataValid = isAgentValid(data);
    if (!isDataValid.isValid) throw new CustomError(isDataValid.msg, 400);

    const accountExists = await Account.findOne({
      username: data.username,
    }).exec();
    if (accountExists) throw new CustomError("Username already exists.", 400);

    const referrer = await Account.findOne({ username: data.referrer })
      .populate("roleId")
      .exec();

    if (!referrer) throw new CustomError("Invalid referrer.", 400);
    if (!referrers.includes(referrer.roleId.name))
      throw new CustomError("Invalid referrer.", 400);

    const role = await Role.findOne({
      level: type === "agent" ? referrer.roleId.level + 1 : 6,
    }).exec();
    if (!role) throw new CustomError("Invalid Role", 400);

    const account = new Account({
      username: data.username,
      password: data.password,
      active: false,
      status: "pending",
      roleId: role._id,
    });
    account.savePassword(data.password);
    await account.save();

    const details = new UserDetail({
      owner: account._id,
      phoneNumber: data.phonenumber,
      email: data.email,
      country: data.country,
      referrer: referrer._id,
    });
    await details.save();

    if (type === "agent" && referrer.roleId.level + 1 !== 6) {
      await UserWallet.insertMany([
        { owner: account._id, type: "commission" },
        { owner: account._id, type: "credit" },
      ]);

      await new ArenaUserDetail({
        owner: account._id,
        commisionRate: 0,
      }).save();
    }

    if (type === "player" || referrer.roleId.level + 1 === 6) {
      await new UserWallet({ owner: account._id, type: "credit" }).save();
    }

    return {
      success: true,
    };
  } catch (error) {
    console.log("CREATE_AUTHORITATIVE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getUsersSender = async filter => {
  try {
    const senders = await Account.find(
      {
        username: new RegExp(filter, "i"),
        $and: [
          { roleId: { $ne: "655c087a40f8fdd3e086e8d0" } },
          { roleId: { $ne: "655c087a40f8fdd3e086e8d1" } },
          { roleId: { $ne: "655c087a40f8fdd3e086e8d7" } },
        ],
      },
      { username: 1 }
    )
      .sort("-createdAt")
      .limit(20)
      .exec();

    return {
      success: true,
      senders: senders,
    };
  } catch (error) {
    console.log("GET_USERS_TRANSFER", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getUsersReceiver = async filter => {
  try {
    const receivers = await Account.find(
      {
        username: new RegExp(filter, "i"),
        $and: [
          { roleId: { $ne: "655c087a40f8fdd3e086e8d0" } },
          { roleId: { $ne: "655c087a40f8fdd3e086e8d1" } },
        ],
      },
      { username: 1 }
    )
      .sort("-createdAt")
      .limit(20)
      .exec();

    return {
      success: true,
      receivers: receivers,
    };
  } catch (error) {
    console.log("GET_USERS_TRANSFER", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.csrGetReceivers = async (filter, userId) => {
  try {
    const receivers = await Account.aggregate([
      {
        $match: {
          $and: [
            { username: new RegExp(filter, "i") },
            {
              _id: {
                $ne: new mongoose.Types.ObjectId(userId),
              },
            },
            {
              roleId: {
                $ne: new mongoose.Types.ObjectId("655c087a40f8fdd3e086e8d0"),
              },
            },
            {
              roleId: {
                $ne: new mongoose.Types.ObjectId("655c087a40f8fdd3e086e8d1"),
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $addFields: {
          wallets: {
            $filter: {
              input: "$wallets",
              as: "wallet",
              cond: { $eq: ["$$wallet.type", "credit"] },
            },
          },
        },
      },
      {
        $project: {
          username: 1,
          wallets: { $arrayElemAt: ["$wallets", 0] },
        },
      },
      {
        $project: {
          username: 1,
          amount: "$wallets.amount",
        },
      },
      {
        $limit: 20,
      },
    ]).exec();

    return {
      success: true,
      receivers: receivers,
    };
  } catch (error) {
    console.log("CSR_GET_RECEIVERS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.agentGetReceivers = async (filter, userId) => {
  try {
    const receivers = await Account.aggregate([
      {
        $match: {
          username: new RegExp(filter, "i"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallet",
        },
      },
      {
        $project: {
          username: 1,
          details: { $arrayElemAt: ["$details", 0] },
          wallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallet",
                  as: "wallet",
                  cond: {
                    $eq: ["$$wallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $project: {
          username: 1,
          amount: "$wallet.amount",
        },
      },
      {
        $limit: 20,
      },
    ]).exec();

    return {
      success: true,
      receivers,
    };
  } catch (error) {
    console.log("AGENT_GET_RECEIVERS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getOwnedPointsByType = async (userId, type) => {
  try {
    const wallet = await UserWallet.findOne({
      owner: userId,
      type,
    }).exec();

    return {
      success: true,
      amount: wallet.amount,
    };
  } catch (error) {
    console.log("GET_OWNED_POINTS_BY_TYPE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.updatePaymentMethod = async (data, token) => {
  try {
    const validate = isPaymentMethodValid(data);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    const updatedDetails = await UserDetail.findOneAndUpdate(
      { owner: token._id },
      {
        $set: {
          bankAcctName: data.acctName,
          bankAcctNumber: data.acctNumber,
          paymentMode: data.paymentMode,
          bankAcctAddDetails: data.addDetails,
        },
      },
      {
        new: true,
      }
    ).exec();

    return {
      success: true,
      details: {
        updatedDetails,
      },
    };
  } catch (error) {
    console.log("UDPATE_PAYMENT_METHOD", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getAgentsByRole = async (roleId, limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.countDocuments({ roleId });

    const agentPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $addFields: {
          creditWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          commsWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "commission"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          username: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          creditWallet: 1,
          commsWallet: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          commissions: {
            $arrayElemAt: ["$commissions", 0],
          },
          referrer: {
            $arrayElemAt: ["$referrer", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          creditWallet: "$creditWallet.amount",
          commsWallet: "$commsWallet.amount",
          referrer: "$referrer.username",
          roleName: "$roleId.name",
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          "commissions._id": 1,
          "commissions.commisionRate": 1,
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          "details.country": 1,
          "details.paymentMode": 1,
          "details.bankAcctName": 1,
          "details.bankAcctNumber": 1,
          "details.bankAcctAddDetails": 1,
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

    const [count, agents] = await Promise.all([countPromise, agentPromise]);

    const hasNextPage = await Account.exists({ roleId }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      agents,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_AGENTS_BY_ROLE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.searchAgentsByRole = async (roleId, limit, page, filter) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.countDocuments({
      roleId,
      username: new RegExp(filter, "i"),
    });

    const agentPromise = Account.aggregate([
      {
        $match: {
          $and: [
            { roleId: mongooseId(roleId) },
            { username: new RegExp(filter, "i") },
          ],
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $addFields: {
          creditWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          commsWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "commission"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          username: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          creditWallet: 1,
          commsWallet: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          commissions: {
            $arrayElemAt: ["$commissions", 0],
          },
          referrer: {
            $arrayElemAt: ["$referrer", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          creditWallet: "$creditWallet.amount",
          commsWallet: "$commsWallet.amount",
          referrer: "$referrer.username",
          roleName: "$roleId.name",
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          "commissions._id": 1,
          "commissions.commisionRate": 1,
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          "details.country": 1,
          "details.paymentMode": 1,
          "details.bankAcctName": 1,
          "details.bankAcctNumber": 1,
          "details.bankAcctAddDetails": 1,
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

    const [count, agents] = await Promise.all([countPromise, agentPromise]);

    const hasNextPage = await Account.exists({
      roleId,
      username: new RegExp(filter, "i"),
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      agents,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_AGENTS_BY_ROLE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getModerators = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.countDocuments({
      roleId: mongooseId("655c087a40f8fdd3e086e8d0"),
    });

    const moderatorPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d0"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleId: 1,
          details: 1,
          referrer: { $arrayElemAt: ["$referrer", 0] },
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleName: "$roleId.name",
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          referrer: "$referrer.username",
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

    const [count, moderators] = await Promise.all([
      countPromise,
      moderatorPromise,
    ]);

    const hasNextPage = await Account.exists({
      roleId: mongooseId("655c087a40f8fdd3e086e8d0"),
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      moderators,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_MODERATORS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.searchModerators = async (limit, page, filter) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.countDocuments({
      roleId: mongooseId("655c087a40f8fdd3e086e8d0"),
      username: new RegExp(filter, "i"),
    });

    const moderatorPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d0"),
          username: new RegExp(filter, "i"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleId: 1,
          details: 1,
          referrer: { $arrayElemAt: ["$referrer", 0] },
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleName: "$roleId.name",
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          referrer: "$referrer.username",
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

    const [count, moderators] = await Promise.all([
      countPromise,
      moderatorPromise,
    ]);

    const hasNextPage = await Account.exists({
      roleId: mongooseId("655c087a40f8fdd3e086e8d0"),
      username: new RegExp(filter, "i"),
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      moderators,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("SEARCH_MODERATORS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getAccountants = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.countDocuments({
      roleId: mongooseId("655c087a40f8fdd3e086e8d1"),
    });

    const accountantPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d1"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleId: 1,
          details: 1,
          referrer: { $arrayElemAt: ["$referrer", 0] },
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleName: "$roleId.name",
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          referrer: "$referrer.username",
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

    const [count, accountants] = await Promise.all([
      countPromise,
      accountantPromise,
    ]);

    const hasNextPage = await Account.exists({
      roleId: mongooseId("655c087a40f8fdd3e086e8d1"),
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      accountants,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_ACCOUNTANTS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.searchAccountants = async (limit, page, filter) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.countDocuments({
      roleId: mongooseId("655c087a40f8fdd3e086e8d1"),
      username: new RegExp(filter, "i"),
    });

    const accountantPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d1"),
          username: new RegExp(filter, "i"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleId: 1,
          details: 1,
          referrer: { $arrayElemAt: ["$referrer", 0] },
        },
      },
      {
        $project: {
          username: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          roleName: "$roleId.name",
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          referrer: "$referrer.username",
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

    const [count, accountants] = await Promise.all([
      countPromise,
      accountantPromise,
    ]);

    const hasNextPage = await Account.exists({
      roleId: mongooseId("655c087a40f8fdd3e086e8d1"),
      username: new RegExp(filter, "i"),
    }).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      accountants,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("SEARCH_ACCOUNTANTS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getAgentsByRoleAndUserId = async (roleId, limit, page, userId) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const agentPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $addFields: {
          creditWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          commsWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "commission"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          username: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          creditWallet: 1,
          commsWallet: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          commissions: {
            $arrayElemAt: ["$commissions", 0],
          },
          referrer: {
            $arrayElemAt: ["$referrer", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          creditWallet: "$creditWallet.amount",
          commsWallet: "$commsWallet.amount",
          referrer: "$referrer.username",
          referrerId: "$referrer._id",
          roleName: "$roleId.name",
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          "commissions._id": 1,
          "commissions.commisionRate": 1,
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          "details.country": 1,
          "details.paymentMode": 1,
          "details.bankAcctName": 1,
          "details.bankAcctNumber": 1,
          "details.bankAcctAddDetails": 1,
        },
      },
      {
        $match: {
          referrerId: mongooseId(userId),
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

    const [count, agents] = await Promise.all([countPromise, agentPromise]);

    const checkNext = await Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $skip: offset + limit,
      },
    ]).exec();

    const hasNextPage = checkNext.length !== 0;
    const hasPrevPage = +page > 1;

    const counter = count.length === 0 ? 0 : count[0].count;

    let totalPages = Math.floor(counter / limit);
    if (counter % limit > 0) totalPages++;

    return {
      success: true,
      agents,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_AGENTS_BY_ROLE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.searchAgentsByRoleUserId = async (
  roleId,
  limit,
  page,
  filter,
  userId
) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
          username: new RegExp(filter, "i"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const agentPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
          username: new RegExp(filter, "i"),
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $addFields: {
          creditWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          commsWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "commission"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          username: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          creditWallet: 1,
          commsWallet: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          commissions: {
            $arrayElemAt: ["$commissions", 0],
          },
          referrer: {
            $arrayElemAt: ["$referrer", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          creditWallet: "$creditWallet.amount",
          commsWallet: "$commsWallet.amount",
          referrer: "$referrer.username",
          referrerId: "$referrer._id",
          roleName: "$roleId.name",
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          "commissions._id": 1,
          "commissions.commisionRate": 1,
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          "details.country": 1,
          "details.paymentMode": 1,
          "details.bankAcctName": 1,
          "details.bankAcctNumber": 1,
          "details.bankAcctAddDetails": 1,
        },
      },
      {
        $match: {
          referrerId: mongooseId(userId),
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

    const [count, agents] = await Promise.all([countPromise, agentPromise]);

    const checkNext = await Account.aggregate([
      {
        $match: {
          roleId: mongooseId(roleId),
          username: new RegExp(filter, "i"),
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $skip: offset + limit,
      },
    ]).exec();
    const hasNextPage = checkNext.length !== 0;
    const hasPrevPage = +page > 1;

    const counter = count.length === 0 ? 0 : count[0].count;

    let totalPages = Math.floor(counter / limit);
    if (counter % limit > 0) totalPages++;

    return {
      success: true,
      agents,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_AGENTS_BY_ROLE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getActivePlayersByUserId = async (limit, page, userId) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d7"),
          status: "approved",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const agentPromise = Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d7"),
          status: "approved",
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $addFields: {
          creditWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          commsWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "commission"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          username: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          creditWallet: 1,
          commsWallet: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          commissions: {
            $arrayElemAt: ["$commissions", 0],
          },
          referrer: {
            $arrayElemAt: ["$referrer", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          creditWallet: "$creditWallet.amount",
          commsWallet: "$commsWallet.amount",
          referrer: "$referrer.username",
          referrerId: "$referrer._id",
          roleName: "$roleId.name",
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          "commissions._id": 1,
          "commissions.commisionRate": 1,
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          "details.country": 1,
          "details.paymentMode": 1,
          "details.bankAcctName": 1,
          "details.bankAcctNumber": 1,
          "details.bankAcctAddDetails": 1,
        },
      },
      {
        $match: {
          referrerId: mongooseId(userId),
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

    const [count, agents] = await Promise.all([countPromise, agentPromise]);

    const checkNext = await Account.aggregate([
      {
        $match: {
          roleId: mongooseId("655c087a40f8fdd3e086e8d7"),
          status: "approved",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $skip: offset + limit,
      },
    ]).exec();

    const hasNextPage = checkNext.length !== 0;
    const hasPrevPage = +page > 1;

    const counter = count.length === 0 ? 0 : count[0].count;

    let totalPages = Math.floor(counter / limit);
    if (counter % limit > 0) totalPages++;

    return {
      success: true,
      players: agents,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_AGENTS_BY_ROLE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getPendingApprovalsByStatusUserId = async (
  limit,
  page,
  userId,
  status
) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Account.aggregate([
      {
        $match: {
          status: status,
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]).exec();

    const agentPromise = Account.aggregate([
      {
        $match: {
          status: status,
        },
      },
      {
        $lookup: {
          from: "userwallets",
          localField: "_id",
          foreignField: "owner",
          as: "wallets",
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "roleId",
        },
      },
      {
        $addFields: {
          creditWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "credit"],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          commsWallet: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$wallets",
                  as: "creditWallet",
                  cond: {
                    $eq: ["$$creditWallet.type", "commission"],
                  },
                },
              },
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,
          username: 1,
          roleId: { $arrayElemAt: ["$roleId", 0] },
          details: { $arrayElemAt: ["$details", 0] },
          creditWallet: 1,
          commsWallet: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "details.referrer",
          foreignField: "_id",
          as: "referrer",
        },
      },
      {
        $lookup: {
          from: "arenauserdetails",
          localField: "_id",
          foreignField: "owner",
          as: "commissions",
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          commissions: {
            $arrayElemAt: ["$commissions", 0],
          },
          referrer: {
            $arrayElemAt: ["$referrer", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          creditWallet: "$creditWallet.amount",
          commsWallet: "$commsWallet.amount",
          referrer: "$referrer.username",
          referrerId: "$referrer._id",
          roleName: "$roleId.name",
          active: 1,
          status: 1,
          verified: 1,
          createdAt: 1,
          "commissions._id": 1,
          "commissions.commisionRate": 1,
          "details.fullname": 1,
          "details.phoneNumber": 1,
          "details.email": 1,
          "details.country": 1,
          "details.paymentMode": 1,
          "details.bankAcctName": 1,
          "details.bankAcctNumber": 1,
          "details.bankAcctAddDetails": 1,
        },
      },
      {
        $match: {
          referrerId: mongooseId(userId),
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

    const [count, agents] = await Promise.all([countPromise, agentPromise]);

    const checkNext = await Account.aggregate([
      {
        $match: {
          status: status,
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "owner",
          as: "details",
        },
      },
      {
        $project: {
          details: { $arrayElemAt: ["$details", 0] },
        },
      },
      {
        $match: {
          "details.referrer": mongooseId(userId),
        },
      },
      {
        $skip: offset + limit,
      },
    ]).exec();

    const hasNextPage = checkNext.length !== 0;
    const hasPrevPage = +page > 1;

    const counter = count.length === 0 ? 0 : count[0].count;

    let totalPages = Math.floor(counter / limit);
    if (counter % limit > 0) totalPages++;

    return {
      success: true,
      players: agents,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_PENDING_APPROVALS_STATUS_USERID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.banUser = async (userId, token) => {
  try {
    if (!isIdValid(userId)) throw new CustomError("Invalid User", 400);

    const details = await UserDetail.findOne({ owner: userId }).exec();
    const account = await Account.findOne({ _id: userId }).exec();

    if (!details) throw new CustomError("Invalid User", 400);
    if (!account) throw new CustomError("Invalid User", 400);

    if (!details.referrer.equals(mongooseId(token._id)))
      throw new CustomError("Invalid User", 400);

    account.status = "blocked";
    account.markModified("status");
    account.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("BAN_USER", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.unbanUser = async (userId, token) => {
  try {
    if (!isIdValid(userId)) throw new CustomError("Invalid User", 400);

    const details = await UserDetail.findOne({ owner: userId }).exec();
    const account = await Account.findOne({ _id: userId }).exec();

    if (!details) throw new CustomError("Invalid User", 400);
    if (!account) throw new CustomError("Invalid User", 400);

    if (!details.referrer.equals(mongooseId(token._id)))
      throw new CustomError("Invalid User", 400);

    account.status = "approved";
    account.markModified("status");
    account.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("BAN_USER", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.approvePlayer = async (userId, token) => {
  try {
    if (!isIdValid(userId)) throw new CustomError("Invalid agent", 400);

    const details = await UserDetail.findOne({ owner: userId }).exec();
    const account = await Account.findOne({ _id: userId }).exec();

    if (!details) throw new CustomError("Invalid User", 400);
    if (!account) throw new CustomError("Invalid User", 400);

    if (!details.referrer.equals(mongooseId(token._id)))
      throw new CustomError("Invalid User", 400);

    account.status = "approved";
    account.markModified("status");
    account.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("APPROVE_PLAYER", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.approveAgent = async (userId, token, commsRate) => {
  try {
    if (!isIdValid(userId)) throw new CustomError("Invalid User", 400);

    const details = await UserDetail.findOne({ owner: userId }).exec();
    const account = await Account.findOne({ _id: userId }).exec();

    if (!details) throw new CustomError("Invalid User", 400);
    if (!account) throw new CustomError("Invalid User", 400);

    if (!details.referrer.equals(mongooseId(token._id)))
      throw new CustomError("Invalid User", 400);

    await ArenaUserDetailService.updateCommissionRate(
      {
        agent: account.username,
        agentId: userId,
        commsRate,
      },
      token
    );

    const agent = await Account.findOne({ _id: userId }).exec();
    agent.status = "approved";
    agent.markModified("status");
    agent.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("APPROVE_AGENT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
