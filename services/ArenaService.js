const { default: mongoose } = require("mongoose");
const Arena = require("../models/Arena");
const Video = require("../models/Video");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const { arenaIsValid } = require("../validators/ArenaValidate");
const { getIOInstance } = require("../socket/global");
const Round = require("../models/Round");
const { outcomeIsValid } = require("../validators/OutcomeValidate");
const Bet = require("../models/Bet");
const { getPayout } = require("../utils/payout");
const UserWallet = require("../models/UserWallet");
const { giveCommissions } = require("../utils/wallet-actions");
const { betsByRoom } = require("../socket/socket");
const EarningHistory = require("../models/EarningHistory");

const mongooseId = id => new mongoose.Types.ObjectId(id);

exports.getUnselectedVideos = async () => {
  try {
    const videos = await Video.find(
      { isSelected: false },
      { name: 1, url: 1 }
    ).exec();

    return {
      success: true,
      videos,
    };
  } catch (error) {
    console.log("GET_UNSELECTED_VIDEOS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getArenas = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;

    const countPromise = Arena.countDocuments({ status: { $ne: "close" } });
    const arenaPromise = Arena.find({ status: { $ne: "close" } })
      .populate("moderator", "username")
      .sort("-createdAt")
      .skip(offset)
      .limit(limit)
      .exec();
    const hasNext = Arena.exists({ status: { $ne: "close" } })
      .skip(limit + offset)
      .exec();

    const [count, arenas, hasNextPage] = await Promise.all([
      countPromise,
      arenaPromise,
      hasNext,
    ]);

    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      arenas,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_ARENAS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getClosedArenas = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;

    const countPromise = Arena.countDocuments({ status: { $eq: "close" } });
    const arenaPromise = Arena.find({ status: { $eq: "close" } })
      .populate("moderator", "username")
      .sort("-createdAt")
      .skip(offset)
      .limit(limit)
      .exec();
    const hasNext = Arena.exists({ status: { $eq: "close" } })
      .skip(limit + offset)
      .exec();

    const [count, arenas, hasNextPage] = await Promise.all([
      countPromise,
      arenaPromise,
      hasNext,
    ]);

    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      arenas,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_CLOSED_ARENAS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.createArena = async (data, token) => {
  try {
    const validate = arenaIsValid(data);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    if (!isIdValid(data.arenaVideo))
      throw new CustomError("Invalid arena video", 400);

    const video = await Video.findOne({ _id: data.arenaVideo }).exec();

    if (!video) throw new CustomError("Invalid arena video", 400);

    if (video.isSelected)
      throw new CustomError(
        "The video you've selected is in use on another arena.",
        400
      );

    const arena = await new Arena({
      moderator: token._id,
      eventName: data.arenaEventName,
      location: data.arenaLocation,
      eventCode: data.eventCode,
      plasadaRate: data.plasadaRate,
      arenaVideo: {
        videoId: video._id,
        name: video.name,
        url: video.url,
      },
      tieRate: data.tieRate,
      eventType: data.eventType,
      drawEnabled: data.drawEnabled,
      creator: token._id,
    }).save();

    video.isSelected = true;
    video.isModified("isSelected");
    video.save();

    return {
      success: true,
      arena,
    };
  } catch (error) {
    console.log("CREATE_ARENA", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.updateArena = async data => {
  try {
    const validate = arenaIsValid(data);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    if (!isIdValid(data.arenaVideo))
      throw new CustomError("Invalid arena video", 400);

    if (!isIdValid(data.arenaId)) throw new CustomError("Invalid arena", 400);

    const videoPromise = Video.findOne({ _id: data.arenaVideo }).exec();
    const arenaPromise = Arena.findOne({ _id: data.arenaId }).exec();

    const [video, arena] = await Promise.all([videoPromise, arenaPromise]);

    if (!video) throw new CustomError("Invalid video", 400);
    if (!arena) throw new CustomError("Invalid arena", 400);

    if (!video._id.equals(arena.arenaVideo.videoId)) {
      if (video.isSelected)
        throw new CustomError(
          "The video you've selected is in use on another arena.",
          400
        );
    }

    const updatedArena = await Arena.findOneAndUpdate(
      { _id: arena._id },
      {
        eventName: data.arenaEventName,
        location: data.arenaLocation,
        eventCode: data.eventCode,
        plasadaRate: data.plasadaRate,
        arenaVideo: {
          videoId: video._id,
          name: video.name,
          url: video.url,
        },
        tieRate: data?.tieRate,
        eventType: data.eventType,
        drawEnabled: data.drawEnabled,
      },
      { new: true }
    )
      .populate("moderator", "username")
      .exec();

    const returnData = {
      success: true,
      arena: updatedArena,
    };

    if (!video._id.equals(arena.arenaVideo.videoId)) {
      const oldVideo = await Video.findOne({
        _id: arena.arenaVideo.videoId,
      }).exec();

      oldVideo.isSelected = false;
      oldVideo.isModified("isSelected");
      oldVideo.save();

      video.isSelected = true;
      video.isModified("isSelected");
      video.save();

      returnData.oldVideo = oldVideo;
    }

    return returnData;
  } catch (error) {
    console.log("UPDATE_ARENA", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.deleteArena = async (arenaId, creator) => {
  try {
    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    if (arena.bettingStatus !== "standby")
      throw new CustomError("Arena is still in progress.", 400);

    if (!arena.creator.equals(mongooseId(creator)))
      throw new CustomError("You are not the creator of this arena.", 400);

    arena.status = "close";
    arena.isControlled = false;
    arena.markModified("status");
    arena.markModified("isControlled");
    arena.save();

    return {
      success: true,
      arenaId: arena._id,
    };
  } catch (error) {
    console.log("DELETE_ARENA", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getArenaById = async arenaId => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    return {
      success: true,
      arena,
    };
  } catch (error) {
    console.log("GET_ARENA_BY_ID", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.controlArena = async (arenaId, token) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const arena = await Arena.findOne({ _id: arenaId })
      .populate("moderator", "username")
      .exec();

    if (!arena) throw new CustomError("Invalid arena", 400);

    const check = await Arena.findOne({
      moderator: token._id,
      isControlled: true,
      _id: { $ne: arena._id },
    }).exec();

    if (check)
      throw new CustomError(
        `You are still controlling an arena (${check.eventName}). Please close current arena to control another arena.`,
        400
      );

    if (
      arena.isControlled &&
      !arena.moderator._id.equals(mongooseId(token._id))
    )
      throw new CustomError(
        `Arena is currently being controlled by ${arena.moderator.username}`
      );

    if (arena.isControlled && arena.moderator._id.equals(mongooseId(token._id)))
      return {
        success: true,
      };

    arena.moderator = token._id;
    arena.isControlled = true;
    arena.markModified("moderator");
    arena.markModified("isControlled");
    arena.save();

    return {
      success: true,
    };
  } catch (error) {
    console.log("CONTROL_ARENA", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.changeArenaBettingStatus = async (arenaId, status) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);
    if (arena.bettingStatus === "close" && status === "open")
      throw new CustomError("Betting is already closed.", 400);

    arena.bettingStatus = status;
    arena.markModified("bettingStatus");
    await arena.save();

    if (status === "open") {
      const round = await Round.findOne({
        arenaId: arena._id,
        roundNumber: +arena.fights,
      }).exec();

      if (!round) {
        new Round({
          arenaId: arena._id,
          roundNumber: +arena.fights,
          outcome: "-",
        }).save();
      }
    }

    getIOInstance().sockets.to(arenaId).emit(`betting:${status}`, {
      arenaId: arena._id,
      bettingStatus: arena.bettingStatus,
    });

    return {
      success: true,
      arenaId: arena._id,
      bettingStatus: arena.bettingStatus,
    };
  } catch (error) {
    console.log("ARENA_OPEN_BETTING", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getPreviousOutcome = async arenaId => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    const round = await Round.find({
      arenaId: arena._id,
      outcome: { $ne: "-" },
      roundNumber: { $ne: arena.fights },
    })
      .sort("-createdAt")
      .limit(1)
      .exec();

    return {
      success: true,
      previousOutcome: round[0] || null,
    };
  } catch (error) {
    console.log("GET_PREVIOUS_OUTCOME", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getCurrentOutcome = async arenaId => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    const round = await Round.findOne({
      arenaId: arena._id,
      roundNumber: arena.fights,
    }).exec();

    return {
      success: true,
      currentRoundOutcome: round ? round.outcome : "-",
    };
  } catch (error) {
    console.log("GET_CURRENT_OUTCOME", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.arenaFinishRound = async (arenaId, result) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena.", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    if (arena.bettingStatus !== "close")
      throw new CustomError("Arena betting status is not yet closed.", 400);

    const validate = outcomeIsValid(result, arena.drawEnabled);
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    const round = await Round.findOne({
      arenaId: arena._id,
      roundNumber: arena.fights,
    }).exec();
    if (!round) throw new CustomError("Invalid round", 400);

    round.outcome = result;
    round.markModified("outcome");
    await round.save();

    getIOInstance().in(arenaId).emit("round:finish", round);

    return {
      success: true,
      currentRound: round,
    };
  } catch (error) {
    console.log("ARENA_FINISH_ROUND", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.giveWinsAndComms = async (playerId, roundId, arenaId) => {
  try {
    if (!isIdValid(arenaId)) throw new CustomError("Invalid arena.", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);

    if (arena.bettingStatus !== "close")
      throw new CustomError("Arena betting status is not yet closed.", 400);

    const round = await Round.findOne({
      _id: roundId,
    }).exec();
    if (!round) throw new CustomError("Invalid round", 400);

    const bet = await Bet.findOne({
      roundId: round._id,
      owner: playerId,
    }).exec();

    if (!bet) {
      return {
        success: true,
        haveBet: false,
      };
    }

    const wallet = await UserWallet.findOne({
      owner: playerId,
      type: "credit",
    }).exec();
    if (!wallet) throw new CustomError("Invalid wallet", 400);

    let didWin = false;

    if (round.outcome === "cancel") {
      await UserWallet.updateOne(
        { _id: wallet._id },
        { $inc: { amount: +bet.amount } }
      ).exec();
    }

    if (bet.bet === "draw" && round.outcome !== "cancel") {
      didWin = bet.bet === round.outcome;
      if (didWin) {
        const netBet = bet.amount - bet.amount * (arena.plasadaRate / 100);
        const winningAmount = netBet * arena.tieRate;

        await UserWallet.updateOne(
          { _id: wallet._id },
          { $inc: { amount: +winningAmount } }
        ).exec();

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
        playerId,
        arena._id,
        round._id,
        bet._id,
        arena.plasadaRate,
        bet.amount
      );
    }

    if (
      (bet.bet === "meron" || bet.bet === "wala") &&
      round.outcome !== "cancel"
    ) {
      const roundPayout = getPayout(arena.plasadaRate, arena._id, bet.amount);
      const playerNetPayout =
        bet.bet === "meron" ? roundPayout.meronPayout : roundPayout.walaPayout;

      didWin = bet.bet === round.outcome;
      if (didWin) {
        await UserWallet.updateOne(
          { _id: wallet._id },
          { $inc: { amount: +playerNetPayout } }
        ).exec();
      }

      const playerGrossPayout =
        bet.bet === "meron" ? roundPayout.calcMeron : roundPayout.calcWala;

      giveCommissions(
        playerId,
        arena._id,
        round._id,
        bet._id,
        arena.plasadaRate,
        playerGrossPayout
      );
    }

    bet.isClaimed = true;
    bet.markModified("isClaimed");
    await bet.save();

    return {
      success: true,
      didWin,
    };
  } catch (error) {
    console.log("GIVE_WINS_AND_COMMS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.arenaUpdateRound = async (arenaId, roundNumber) => {
  try {
    if (isNaN(roundNumber)) throw new CustomError("Invalid Round Number", 400);

    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);
    if (arena.bettingStatus !== "standby")
      throw new CustomError(
        "You can only update round number when betting is on standby",
        400
      );

    if (+arena.fights >= +roundNumber)
      throw new CustomError("Please enter other round number", 400);

    const round = await Round.findOne({
      arenaId: arena._id,
      roundNumber,
    }).exec();
    if (round) throw new CustomError("Arena round already exists", 400);

    arena.fights = +roundNumber;
    arena.markModified("fights");
    arena.save();

    getIOInstance().to(arenaId).emit("round:set", arena);

    return {
      success: true,
      arena: arena,
    };
  } catch (error) {
    console.log("ARENA_UPDATE_ROUND", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.arenaNextRound = async arenaId => {
  try {
    const arena = await Arena.findOne({ _id: arenaId }).exec();
    if (!arena) throw new CustomError("Invalid arena", 400);
    if (arena.bettingStatus !== "close")
      throw new CustomError("Round is not yet finished.", 400);

    const currentRoundPromise = Round.findOne({
      arenaId: arena._id,
      roundNumber: arena.fights,
    }).exec();

    const nextRoundPromise = Round.findOne({
      arenaId: arena._id,
      roundNumber: arena.fights + 1,
    }).exec();

    const [currentRound, nextRound] = await Promise.all([
      currentRoundPromise,
      nextRoundPromise,
    ]);

    if (!currentRound) throw new CustomError("Invalid Round", 400);
    if (currentRound.outcome === "-")
      throw new CustomError("Round is not yet finished", 400);

    if (nextRound) throw new CustomError("Arena round already exists", 400);

    arena.fights += 1;
    arena.bettingStatus = "standby";
    arena.markModified("fights");
    arena.markModified("bettingStatus");
    arena.save();

    betsByRoom.get(`${arena._id}`)["totalMeron"] = 0;
    betsByRoom.get(`${arena._id}`)["totalWala"] = 0;
    getIOInstance().to(`${arena._id}`).emit("round:next", arena);

    return {
      success: true,
      arena: arena,
    };
  } catch (error) {
    console.log("ARENA_NEXT_ROUND", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
