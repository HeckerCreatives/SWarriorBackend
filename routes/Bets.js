const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  betWala,
  betMeron,
  getCurrentBet,
  betDraw,
  adminGetBets,
  getBetByArenaIdAndUserId,
  getUnprocessedBets,
  processUnprocessedBets,
} = require("../controllers/Bets");

const router = require("express").Router();

router
  .post(
    "/wala/create",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    betWala
  )
  .post(
    "/meron/create",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    betMeron
  )
  .post(
    "/draw/create",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    betDraw
  )
  .put(
    "/unprocessed/bets",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    processUnprocessedBets
  )
  .get(
    "/current/:arenaId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    getCurrentBet
  )
  .get(
    "/history/:arenaId",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    getBetByArenaIdAndUserId
  )
  .get(
    "/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    adminGetBets
  )
  .get(
    "/unprocessed/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Player"]),
    getUnprocessedBets
  );

module.exports = router;
