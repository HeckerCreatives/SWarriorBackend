const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  getCommissionHistories,
  getCommissionData,
  getCommissionByArenaIdAndUserId,
} = require("../controllers/CommissionHistories");

const router = require("express").Router();

router
  .get(
    "/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getCommissionHistories
  )
  .get(
    "/:limit/:page/:arenaId/by-user",
    passport.authenticate("jwt", { session: false }),
    isAuthorize([
      "Superadmin",
      "Financer",
      "Sub",
      "Master",
      "Gold",
      "Accountant",
    ]),
    getCommissionByArenaIdAndUserId
  )
  .get(
    "/dashboard",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getCommissionData
  );

module.exports = router;
