const Video = require("../models/Video");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const { videoIsValid } = require("../validators/VideoValidate");

exports.getVideos = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;

    const countPromise = Video.countDocuments();
    const videoPromise = Video.find()
      .sort("-createdAt")
      .skip(offset)
      .limit(limit)
      .exec();
    const hasNext = Video.exists()
      .skip(limit + offset)
      .exec();

    const [count, videos, hasNextPage] = await Promise.all([
      countPromise,
      videoPromise,
      hasNext,
    ]);

    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      videos,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_VIDEOS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.createVideo = async (name, url) => {
  try {
    const validate = videoIsValid({ name, url });

    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    const video = await new Video({
      name,
      url,
    }).save();

    return {
      success: true,
      video,
    };
  } catch (error) {
    console.log("CREATE_VIDEO", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.updateVideo = async (videoId, name, url) => {
  try {
    const validate = videoIsValid({ name, url });
    if (!validate.isValid) throw new CustomError(validate.msg, 400);

    if (!isIdValid(videoId)) throw new CustomError("Invalid video.", 400);

    const video = await Video.findOne({ _id: videoId }).exec();

    if (!video) throw new CustomError("Invalid video", 400);

    const updateVideo = await Video.findOneAndUpdate(
      { _id: video._id },
      {
        $set: {
          name,
          url,
        },
      },
      { new: true }
    ).exec();

    return {
      success: true,
      video: updateVideo,
    };
  } catch (error) {
    console.log("UPDATE_VIDEO", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.deleteVideo = async videoId => {
  try {
    if (!isIdValid(videoId)) throw new CustomError("Invalid video", 400);

    const video = await Video.findOne({ _id: videoId }).exec();

    if (!video) throw new CustomError("Invalid video", 400);

    if (video.isSelected)
      throw new CustomError(
        "This video is still in use on an active arena.",
        400
      );

    await Video.deleteOne({ _id: videoId }).exec();

    return {
      success: true,
      videoId: video._id,
    };
  } catch (error) {
    console.log("DELETE_VIDEO", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
