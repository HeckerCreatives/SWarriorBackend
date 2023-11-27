const passport = require("passport");
const {
  transferCredit,
  getTransferHistories,
  agentTransferPoints,
  agentGetTransferHistories,
  getTransferHistoriesById,
} = require("../controllers/Transfers");
const { isAuthorize } = require("../middleware/authorize");

const router = require("express").Router();

router
  .get(
    "/:limit/:page/history",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getTransferHistories
  )
  .get(
    "/agent/:limit/:page/history",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["CSR", "Financer", "Sub", "Master", "Gold"]),
    agentGetTransferHistories
  )
  .get(
    "/:agentId/:limit/:page/by-agent",
    passport.authenticate("jwt", { session: false }),
    isAuthorize([
      "Superadmin",
      "Accountant",
      "CSR",
      "Financer",
      "Sub",
      "Master",
      "Gold",
    ]),
    getTransferHistoriesById
  )
  .put(
    "/credit",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    transferCredit
  )
  .put(
    "/agent/credit",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["CSR", "Financer", "Sub", "Master", "Gold"]),
    agentTransferPoints
  );

module.exports = router;
