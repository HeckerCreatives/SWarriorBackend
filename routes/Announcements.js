const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  createAnnoucement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  getRecentAnnouncement,
} = require("../controllers/Announcements");
const { announcementUploadCheck } = require("../middleware/image-upload");

const router = require("express").Router();

router
  .get("/:limit/:page/recent", getRecentAnnouncement)
  .get(
    "/:limit/:page",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getAnnouncements
  )
  .post(
    "/",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    announcementUploadCheck,
    createAnnoucement
  )
  .put(
    "/",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    announcementUploadCheck,
    updateAnnouncement
  )
  .delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    deleteAnnouncement
  );

module.exports = router;
