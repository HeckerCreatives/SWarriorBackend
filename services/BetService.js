const { default: mongoose } = require("mongoose");
const Arena = require("../models/Arena");
const Bet = require("../models/Bet");
const Round = require("../models/Round");
const UserWallet = require("../models/UserWallet");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const { betIsValid } = require("../validators/BetValidate");
const { getOtherPayout } = require("../utils/payout");
const { giveCommissions } = require("../utils/wallet-actions");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.betByType = async (arenaId, bet, amount, token) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    if (bet === "draw" && amount > 1000)
      throw new CustomError("Max bet on DRAW is 1000", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);
    if (arena.bettingStatus !== "open")
      throw new CustomError(
        `Betting is currently on ${arena.bettingStatus}`,
        400
      );

    const round = await Round.findOne({
      arenaId: arena._id,
      roundNumber: arena.fights,
    }).exec();
    if (!round) throw new CustomError("Invalid round", 400);

    const validate = betIsValid(bet, amount, arena.drawEnabled);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    const didBet = await Bet.findOne({
      roundId: round._id,
      owner: token._id,
    }).exec();

    if (didBet)
      throw new CustomError(
        `You already bet on ${didBet.bet} (${didBet.amount}) in this round.`,
        400
      );

    const wallet = await UserWallet.findOne({
      owner: token._id,
      type: "credit",
    }).exec();

    if (+wallet.amount < +amount)
      throw new CustomError("Insufficient balance.", 400);

    const newBet = await new Bet({
      arenaId: arena._id,
      roundId: round._id,
      owner: token._id,
      bet,
      amount,
    }).save();

    await UserWallet.updateOne(
      { _id: wallet._id },
      {
        $inc: { amount: -amount },
      }
    ).exec();

    return {
      success: true,
      bet: newBet,
    };
  } catch (error) {
    console.log("BET_BY_TYPE", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCurrentBet = async (arenaId, token) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    const round = await Round.findOne({
      arenaId: arena._id,
      roundNumber: arena.fights,
    }).exec();

    let bet = null;

    if (round) {
      bet = await Bet.findOne({
        arenaId: arena._id,
        owner: token._id,
        roundId: round._id,
      }).exec();
    }

    return {
      success: true,
      currentBet: bet || null,
    };
  } catch (error) {
    console.log("GET_CURRENT_BET", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.adminGetBets = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Bet.countDocuments({});
    const betPromise = Bet.find()
      .populate("arenaId", "fights eventName -_id")
      .populate("roundId", "roundNumber outcome -_id")
      .populate("owner", "username -_id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, bets] = await Promise.all([countPromise, betPromise]);

    const hasNextPage = await Bet.exists({}).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      bets,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("ADMIN_GET_BETS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getBetByArenaIdAndUserId = async (owner, arenaId) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const bets = await Bet.aggregate([
      {
        $match: {
          owner: mongooseId(owner),
          arenaId: mongooseId(arenaId),
        },
      },
      {
        $lookup: {
          from: "rounds",
          localField: "roundId",
          foreignField: "_id",
          as: "round",
        },
      },
      {
        $unwind: "$round",
      },
      {
        $project: {
          createdAt: 1,
          myBet: "$bet",
          outcome: "$round.outcome",
          round: "$round.roundNumber",
          amount: "$amount",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]).exec();

    return {
      success: true,
      bets,
    };
  } catch (error) {
    console.log("GET_BET_BY_ARENAID_AND_USERID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getUnprocessedBets = async (limit, page, owner) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Bet.countDocuments({ owner, isClaimed: false });
    const betPromise = Bet.find({ owner, isClaimed: false })
      .populate("arenaId", "eventName -_id status")
      .populate("roundId", "roundNumber -_id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, bets] = await Promise.all([countPromise, betPromise]);

    const hasNextPage = await Bet.exists({ owner, isClaimed: false }).skip(
      offset + limit
    );
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      bets,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_UNPROCESSED_BETS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.processUnprocessedBets = async owner => {
  try {
    const unprocessedBets = await Bet.find({ owner, isClaimed: false })
      .populate("roundId")
      .populate("arenaId")
      .exec();

    if (unprocessedBets.length === 0)
      return {
        success: true,
      };

    const wallet = await UserWallet.findOne({
      owner,
      type: "credit",
    }).exec();
    if (!wallet) throw new CustomError("Invalid wallet", 400);

    await Promise.all(
      unprocessedBets.map(async bet => {
        if (bet.bet === "draw" && bet.roundId.outcome !== "cancel") {
          didWin = bet.bet === bet.roundId.outcome;
          if (didWin) {
            const netBet =
              bet.amount - bet.amount * (bet.arenaId.plasadaRate / 100);
            const winningAmount = netBet * bet.arenaId.tieRate;

            await UserWallet.updateOne(
              { _id: wallet._id },
              {
                $inc: { amount: +winningAmount },
              }
            );

            await UserWallet.updateOne(
              { _id: "65640f774c6a1f5621312fdc" },
              { $inc: { amount: -winningAmount } }
            ).exec();
          }

          if (!didWin) {
            const netBet = bet.amount - bet.amount * (arena.plasadaRate / 100);
            await UserWallet.updateOne(
              { _id: "65640f774c6a1f5621312fdd" },
              { $inc: { amount: +netBet } }
            ).exec();

            await new EarningHistory({
              type: "draw",
              amount: +netBet,
            }).save();
          }

          giveCommissions(
            owner,
            bet.arenaId._id,
            bet.roundId._id,
            bet._id,
            bet.arenaId.plasadaRate,
            bet.amount
          );
        }

        if (
          (bet.bet === "meron" || bet.bet === "wala") &&
          bet.roundId.outcome !== "cancel"
        ) {
          const totalMeronPromise = Bet.aggregate([
            {
              $match: {
                roundId: mongooseId(bet.roundId._id),
                arenaId: mongooseId(bet.arenaId._id),
              },
            },
            {
              $match: {
                bet: "meron",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ]).exec();

          const totalWalaPromise = Bet.aggregate([
            {
              $match: {
                roundId: mongooseId(bet.roundId._id),
                arenaId: mongooseId(bet.arenaId._id),
              },
            },
            {
              $match: {
                bet: "wala",
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ]).exec();

          const [totalMeron, totalWala] = await Promise.all([
            totalMeronPromise,
            totalWalaPromise,
          ]);

          const roundPayout = getOtherPayout(
            bet.arenaId.plasadaRate,
            bet.amount,
            totalMeron.length === 0 ? 0 : totalMeron[0].total,
            totalWala.length === 0 ? 0 : totalWala[0].total
          );

          const playerNetPayout =
            bet.bet === "meron"
              ? roundPayout.meronPayout
              : roundPayout.walaPayout;

          didWin = bet.bet === bet.roundId.outcome;
          if (didWin) {
            await UserWallet.updateOne(
              { _id: wallet._id },
              { $inc: { amount: playerNetPayout } }
            ).exec();
          }

          giveCommissions(
            owner,
            bet.arenaId._id,
            bet.roundId._id,
            bet._id,
            bet.arenaId.plasadaRate,
            bet.amount
          );
        }

        await Bet.updateOne(
          { _id: bet._id },
          {
            $set: { isClaimed: true },
          }
        ).exec();
      })
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log("PROCESS_UNPROCESSED_BETS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
