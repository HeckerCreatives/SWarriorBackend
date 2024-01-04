const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const { getRoundsByArena } = require("../controllers/Rounds");

const router = require("express").Router();

router.get(
  "/:arenaId/all",
  passport.authenticate("jwt", { session: false }),
  isAuthorize(["Superadmin", "Moderator", "Player"]),
  getRoundsByArena
);

module.exports = router;
