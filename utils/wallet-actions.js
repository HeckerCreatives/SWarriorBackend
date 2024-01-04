const { default: mongoose } = require("mongoose");
const UserDetail = require("../models/UserDetail");
const UserWallet = require("../models/UserWallet");
const CommisionHistory = require("../models/CommisionHistory");

const toObjectId = id => new mongoose.Types.ObjectId(id);

exports.addToWallet = async (ownerId, type, amount) => {
  const wallet = await UserWallet.findOne({
    owner: ownerId,
    type: type,
  }).exec();

  wallet.amount += +amount;
  wallet.markModified("amount");
  wallet.save();
};

exports.subtractToWallet = async (ownerId, type, amount) => {
  const wallet = await UserWallet.findOne({
    owner: ownerId,
    type: type,
  }).exec();

  wallet.amount -= +amount;
  wallet.markModified("amount");
  wallet.save();
};

const giveComms = async (
  receiver,
  sender,
  arenaId,
  roundId,
  prevRate,
  currentRate,
  roleName,
  plasadaRate,
  grossPayout,
  betId
) => {
  let commsRate = currentRate;
  if (prevRate && roleName !== "Superadmin") commsRate -= prevRate;
  if (prevRate && roleName === "Superadmin") commsRate = plasadaRate - prevRate;

  const commission = (commsRate / 100) * grossPayout;

  await UserWallet.updateOne(
    {
      owner: receiver,
      type: "commission",
    },
    {
      $inc: { amount: commission },
    }
  );

  await new CommisionHistory({
    sender: sender,
    receiver: receiver,
    betId,
    amount: commission,
    arena: arenaId,
    round: roundId,
  }).save();
};

exports.giveCommissions = async (
  playerId,
  arenaId,
  roundId,
  betId,
  plasadaRate,
  grossPayout
) => {
  const referrers = await UserDetail.aggregate([
    {
      $match: {
        owner: toObjectId(playerId),
      },
    },
    {
      $graphLookup: {
        from: "userdetails",
        startWith: "$referrer",
        connectFromField: "referrer",
        connectToField: "owner",
        as: "referrals",
        maxDepth: 6,
        depthField: "depth",
      },
    },
    {
      $unwind: {
        path: "$referrals",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "arenauserdetails",
        localField: "referrals.owner",
        foreignField: "owner",
        as: "commission",
      },
    },
    {
      $unwind: {
        path: "$commission",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "referrals.owner",
        foreignField: "_id",
        as: "account",
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
      $project: {
        referrals: {
          _id: "$account._id",
          roleId: "$account.roleId",
          roleName: "$role.name",
          username: "$account.username",
          commisionRate: "$commission.commisionRate",
          depth: "$referrals.depth",
        },
      },
    },
    {
      $sort: {
        "referrals.depth": 1,
      },
    },
    {
      $group: {
        _id: "$_id",
        referrers: { $push: "$referrals" },
      },
    },
  ]).exec();

  if (referrers.length === 0 || referrers[0].referrers.length === 0) return;

  await Promise.all(
    referrers[0].referrers.map((referrer, i) =>
      giveComms(
        referrer._id,
        playerId,
        arenaId,
        roundId,
        referrers[0].referrers[i - 1]
          ? referrers[0].referrers[i - 1].commisionRate
          : null,
        referrer.commisionRate,
        referrer.roleName,
        plasadaRate,
        grossPayout,
        betId
      )
    )
  );
};
