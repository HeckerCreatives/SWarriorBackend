const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  getAllAgentsCommissions,
  getAllAgentsCredits,
  getAllPlayersCredits,
  getAllConvertedCommissions,
  getOtherStats,
  getCompanyCommission,
  getRegularEarnings,
} = require("../controllers/Dashboard");

const router = require("express").Router();

router
  .get(
    "/agent/total/commissions",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAllAgentsCommissions
  )
  .get(
    "/agent/total/credits",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAllAgentsCredits
  )
  .get(
    "/player/total/credits",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAllPlayersCredits
  )
  .get(
    "/converted/total/commissions",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAllConvertedCommissions
  )
  .get(
    "/company/commissions",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getCompanyCommission
  )
  .get(
    "/other/stats",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getOtherStats
  )
  .get(
    "/regular/earnings",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getRegularEarnings
  );

module.exports = router;
