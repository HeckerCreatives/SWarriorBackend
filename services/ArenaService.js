const Arena = require("../models/Arena");
const Video = require("../models/Video");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const { arenaIsValid } = require("../validators/ArenaValidate");

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

exports.deleteArena = async arenaId => {
  try {
    const arena = await Arena.findOne({ _id: arenaId }).exec();

    if (!arena) throw new CustomError("Invalid arena", 400);

    arena.status = "close";
    arena.markModified("status");
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
