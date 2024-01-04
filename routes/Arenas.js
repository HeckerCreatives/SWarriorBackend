const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  getVideos,
  createArena,
  getArenas,
  updateArena,
  deleteArena,
  getClosedArenas,
  controlArena,
  getArenaById,
  arenaOpenBetting,
  arenaCloseBetting,
  getPreviousOutcome,
  arenaFinishRound,
  getCurrentOutcome,
  arenaNextRound,
  giveWinsAndComms,
  arenaUpdateRound,
} = require("../controllers/Arenas");
const { isController } = require("../middleware/isController");

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
  .put(
    "/betting/open",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    isController,
    arenaOpenBetting
  )
  .put(
    "/betting/close",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    isController,
    arenaCloseBetting
  )
  .put(
    "/finish/round",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    isController,
    arenaFinishRound
  )
  .put(
    "/player/finish/round",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    giveWinsAndComms
  )
  .put(
    "/next/round",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    isController,
    arenaNextRound
  )
  .put(
    "/set/round",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    isController,
    arenaUpdateRound
  )
  .delete(
    "/:arenaId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    deleteArena
  )
  .get(
    "/outcome/:arenaId/previous",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator", "Player"]),
    getPreviousOutcome
  )
  .get(
    "/outcome/:arenaId/current",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator", "Player"]),
    getCurrentOutcome
  )
  .get(
    "/:arenaId/byId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator", "Player"]),
    getArenaById
  )
  .get(
    "/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize([
      "Superadmin",
      "Moderator",
      "Player",
      "Accountant",
      "Financer",
      "Sub",
      "Master",
      "Gold",
    ]),
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
  )
  .get(
    "/control/:arenaId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Moderator"]),
    controlArena
  );

module.exports = router;
