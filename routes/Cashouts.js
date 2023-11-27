const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  requestCreditCashout,
  requestCommissionCashout,
  getOwnCreditRequest,
  getOwnCommissionRequest,
  getAllPendingCreditCashout,
  getAllPendingCommissionCashout,
  getAllPendingCreditCashoutByUserId,
  getAllPendingCommissionCashoutByUserId,
  adminApproveCashout,
  adminRejectCashout,
  agentApproveCashout,
  agentRejectCashout,
} = require("../controllers/Cashouts");

const router = require("express").Router();

router
  .get(
    "/own/request/:limit/:page/credit",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold", "Player"]),
    getOwnCreditRequest
  )
  .get(
    "/own/request/:limit/:page/commission",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getOwnCommissionRequest
  )
  .get(
    "/pending/request/:limit/:page/credit",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR"]),
    getAllPendingCreditCashout
  )
  .get(
    "/pending/request/:limit/:page/commission",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR"]),
    getAllPendingCommissionCashout
  )
  .get(
    "/referral/pending/request/:limit/:page/credit",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getAllPendingCreditCashoutByUserId
  )
  .get(
    "/referral/pending/request/:limit/:page/commission",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getAllPendingCommissionCashoutByUserId
  )
  .put(
    "/credit",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold", "Player"]),
    requestCreditCashout
  )
  .put(
    "/commission",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    requestCommissionCashout
  )
  .put(
    "/approve/cashout",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR"]),
    adminApproveCashout
  )
  .put(
    "/reject/cashout",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR"]),
    adminRejectCashout
  )
  .put(
    "/agent/approve/cashout",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    agentApproveCashout
  )
  .put(
    "/agent/reject/cashout",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    agentRejectCashout
  );

module.exports = router;
