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
  getTotalDrawEarnings,
  getDailyDrawEarnings,
  getAgentDailyCommissions,
  getCompanyDailyCommissions,
  getDrawEarnings,
  getCompanyEarnings,
  getAgentEarnings,
} = require("../controllers/Dashboard");

const router = require("express").Router();

router
  .get(
    "/earnings/total",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getTotalDrawEarnings
  )
  .get(
    "/earnings/daily",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getDailyDrawEarnings
  )
  .get(
    "/agent/total/commissions",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAllAgentsCommissions
  )
  .get(
    "/agent/daily/commissions",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAgentDailyCommissions
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
    "/company/daily/commissions",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getCompanyDailyCommissions
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
  )
  .get(
    "/regular/draw-earnings",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getDrawEarnings
  )
  .get(
    "/regular/company-earnings",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getCompanyEarnings
  )
  .get(
    "/regular/agent-earnings",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getAgentEarnings
  );

module.exports = router;
