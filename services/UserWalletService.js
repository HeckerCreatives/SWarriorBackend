const { default: mongoose } = require("mongoose");
const UserWallet = require("../models/UserWallet");
const CustomError = require("../utils/custom-error");
const Account = require("../models/Account");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.getTopPoints = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;

    const countPromise = Account.aggregate([
      {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8d0"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
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
        $match: {
          "creditWallet.amount": { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    const walletPromise = Account.aggregate([
      {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8d0"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
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
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          createdAt: 1,
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
          createdAt: 1,
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
          creditWallet: { $gt: 0 },
        },
      },
      {
        $sort: {
          creditWallet: -1,
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: +limit,
      },
    ]).exec();

    const [count, wallets] = await Promise.all([countPromise, walletPromise]);

    const checkNext = await Account.aggregate([
      {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8d0"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
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
        $match: {
          "creditWallet.amount": { $gt: 0 },
        },
      },
      {
        $skip: offset + limit,
      },
    ]);
    const hasNextPage = checkNext.length !== 0;
    const hasPrevPage = +page > 1;

    const counter = count.length === 0 ? 0 : count[0].count;

    let totalPages = Math.floor(counter / limit);
    if (counter % limit > 0) totalPages++;

    return {
      success: true,
      wallets,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_TOP_POINTS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getTopCommissions = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;

    const countPromise = Account.aggregate([
      {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8d0"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
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
          creditWallet: {
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
        $match: {
          "creditWallet.amount": { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    const walletPromise = Account.aggregate([
      {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8d0"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
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
          _id: 1,
          username: 1,
          roleId: 1,
          creditWallet: 1,
          commsWallet: 1,
          details: 1,
          active: 1,
          status: 1,
          createdAt: 1,
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
          createdAt: 1,
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
          commsWallet: { $gt: 0 },
        },
      },
      {
        $sort: {
          commsWallet: -1,
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: +limit,
      },
    ]).exec();

    const [count, wallets] = await Promise.all([countPromise, walletPromise]);

    const checkNext = await Account.aggregate([
      {
        $match: {
          roleId: {
            $nin: [
              mongooseId("655c087a40f8fdd3e086e8d0"),
              mongooseId("655c087a40f8fdd3e086e8d1"),
              mongooseId("655c087a40f8fdd3e086e8cf"),
              mongooseId("655c087a40f8fdd3e086e8d2"),
            ],
          },
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
          creditWallet: {
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
        $match: {
          "creditWallet.amount": { $gt: 0 },
        },
      },
      {
        $skip: offset + limit,
      },
    ]);
    const hasNextPage = checkNext.length !== 0;
    const hasPrevPage = +page > 1;

    const counter = count.length === 0 ? 0 : count[0].count;

    let totalPages = Math.floor(counter / limit);
    if (counter % limit > 0) totalPages++;

    return {
      success: true,
      wallets,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_TOP_COMMISSIONS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
