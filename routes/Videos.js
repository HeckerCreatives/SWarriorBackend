const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  createVideo,
  getVideos,
  updateVideo,
  deleteVideo,
} = require("../controllers/Video");

const router = require("express").Router();

router
  .get(
    "/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    getVideos
  )
  .put(
    "/",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    updateVideo
  )
  .post(
    "/",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    createVideo
  )
  .delete(
    "/:videoId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    deleteVideo
  );

module.exports = router;
