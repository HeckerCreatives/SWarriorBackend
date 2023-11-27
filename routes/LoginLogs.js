const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  getLoginLogs,
  getCreditCashoutLogs,
  getCommissionCashoutLogs,
  agentGetCreditCashoutLogs,
  agentGetCommissionCashoutLogs,
} = require("../controllers/LoginLogs");

const router = require("express").Router();

router
  .get(
    "/:limit/:page",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getLoginLogs
  )
  .get(
    "/credit/:limit/:page",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    getCreditCashoutLogs
  )
  .get(
    "/commission/:limit/:page",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    getCommissionCashoutLogs
  )
  .get(
    "/agent/credit/:limit/:page",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    agentGetCreditCashoutLogs
  )
  .get(
    "/agent/commission/:limit/:page",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    agentGetCommissionCashoutLogs
  );

module.exports = router;
