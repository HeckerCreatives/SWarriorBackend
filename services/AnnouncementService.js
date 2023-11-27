const Announcement = require("../models/Announcement");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");
const { announcementIsValid } = require("../validators/AnnouncementValidate");
const fs = require("fs");
const path = require("path");

exports.getAnnouncements = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Announcement.countDocuments({});
    const announcementPromise = Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, announcements] = await Promise.all([
      countPromise,
      announcementPromise,
    ]);

    const hasNextPage = await Announcement.exists({}).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      announcements,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };
  } catch (error) {
    console.log("GET_ANNOUNCEMENTS", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.createAnnoucement = async (data, file, token) => {
  try {
    const { title, description } = data;
    const image = `assets/uploads/${token._id}/announcement/${file.filename}`;

    const validate = announcementIsValid(data);
    if (!validate.isValid) cb(new CustomError(validate.msg, 400));

    const announcement = await new Announcement({
      title,
      image,
      description,
    }).save();

    return {
      success: true,
      announcement,
    };
  } catch (error) {
    console.log("CREATE_ANNOUNCEMENT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.updateAnnouncement = async (data, file, token) => {
  try {
    try {
      const { title, description, announcementId } = data;

      if (!isIdValid(announcementId))
        throw new CustomError("Invalid announcement", 400);

      const validate = announcementIsValid(data);
      if (!validate.isValid) cb(new CustomError(validate.msg, 400));

      const oldAnnc = await Announcement.findOne({
        _id: announcementId,
      }).exec();

      if (!oldAnnc) throw new CustomError("Invalid announcement", 400);

      const anncData = { title, description };
      if (file) {
        anncData.image = `assets/uploads/${token._id}/announcement/${file.filename}`;
        fs.unlink(
          path.resolve(`${global.rootDir}\\${oldAnnc.image}`),
          err => {}
        );
      }

      const updatedAnnouncement = await Announcement.findOneAndUpdate(
        { _id: announcementId },
        {
          ...anncData,
        },
        { new: true }
      );

      return {
        success: true,
        announcement: updatedAnnouncement,
      };
    } catch (error) {
      console.log("CREATE_ANNOUNCEMENT", error);
      throw new CustomError(error.message, error.statusCode || 500);
    }
  } catch (error) {
    console.log("UPDATE_ANNOUNCEMENT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.deleteAnnouncement = async announcementId => {
  try {
    if (!isIdValid(announcementId))
      throw new CustomError("Invalid announcement", 400);

    const announcement = await Announcement.findOne({
      _id: announcementId,
    }).exec();

    if (!announcement) throw new CustomError("Invalid Announcement", 400);

    let deleted = true;
    fs.unlink(path.resolve(`${global.rootDir}\\${announcement.image}`), err => {
      if (err) deleted = false;
    });
    if (!deleted)
      throw new Error(
        "Failed to delete the image connected to the announcement. Please try again.",
        400
      );

    await Announcement.deleteOne({ _id: announcementId }).exec();

    return {
      success: true,
      announcementId: announcement._id,
    };
  } catch (error) {
    console.log("UPDATE_ANNOUNCEMENT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

exports.getRecentAnnouncement = async (limit, page) => {
  try {
    const offset = (+page - 1) * limit;
    const countPromise = Announcement.countDocuments({});
    const announcementPromise = await Announcement.find(
      {},
      { title: 1, image: 1, description: 1, _id: 0, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();

    const [count, announcements] = await Promise.all([
      countPromise,
      announcementPromise,
    ]);

    const hasNextPage = await Announcement.exists({}).skip(offset + limit);
    const hasPrevPage = +page > 1;

    let totalPages = Math.floor(count / limit);
    if (count % limit > 0) totalPages++;

    return {
      success: true,
      announcements,
      totalPages,
      nextPage: hasNextPage ? +page + 1 : null,
      prevPage: hasPrevPage ? +page - 1 : null,
    };

    return {
      success: true,
      announcements,
    };
  } catch (error) {
    console.log("GET_RECENT_ANNOUNCEMENT", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
