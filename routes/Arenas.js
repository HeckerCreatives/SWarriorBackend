const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  getVideos,
  createArena,
  getArenas,
  updateArena,
  deleteArena,
  getClosedArenas,
} = require("../controllers/Arenas");

const router = require("express").Router();

router
  .post(
    "/",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    createArena
  )
  .put(
    "/",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    updateArena
  )
  .delete(
    "/:arenaId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    deleteArena
  )
  .get(
    "/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator", "Player"]),
    getArenas
  )
  .get(
    "/:limit/:page/closed",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    getClosedArenas
  )
  .get(
    "/videos",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    getVideos
  );

module.exports = router;
