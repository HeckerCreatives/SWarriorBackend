const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  createAuthoritative,
  getReferrer,
  createAgentPlayer,
  getSenders,
  getReceivers,
  csrGetReceivers,
  getOwnedCreditPoints,
  updatePaymentMethod,
  getFinancers,
  getSubs,
  getMasters,
  getGolds,
  searchFinancers,
  searchSubs,
  searchMasters,
  searchGolds,
  getModerators,
  searchModerators,
  getAccountants,
  searchAccountants,
  getCsrs,
  searchCsrs,
  getPlayers,
  searchPlayers,
  getProfile,
  getOwnedCommissionpoints,
  getSubsByUserId,
  searchSubsByUserId,
  getMastersByUserId,
  searchMastersByUserId,
  getGoldsByUserId,
  searchGoldByUserId,
  getActivePlayerByUserId,
  banUser,
  getPendingUsersById,
  getBannedUsersById,
  approvePlayer,
  approveAgent,
  unbanUser,
  agentGetReceivers,
} = require("../controllers/Users");
const { searchActivePlayersByUserId } = require("../services/UserService");

const router = require("express").Router();

router
  .get("/referrer/:userId", getReferrer)
  .get("/profile", passport.authenticate("jwt", { session: false }), getProfile)
  .get(
    "/sender/:filter",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getSenders
  )
  .get(
    "/receiver/:filter",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getReceivers
  )
  .get(
    "/csr/receiver/:filter",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["CSR"]),
    csrGetReceivers
  )
  .get(
    "/agent/receiver/:filter",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    agentGetReceivers
  )
  .get(
    "/credit/owned",
    passport.authenticate("jwt", { session: false }),
    getOwnedCreditPoints
  )
  .get(
    "/commission/owned",
    passport.authenticate("jwt", { session: false }),
    getOwnedCommissionpoints
  )
  .get(
    "/financers/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    getFinancers
  )
  .get(
    "/financers/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    searchFinancers
  )
  .get(
    "/subs/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    getSubs
  )
  .get(
    "/subs/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    searchSubs
  )
  .get(
    "/masters/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    getMasters
  )
  .get(
    "/masters/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    searchMasters
  )
  .get(
    "/golds/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    getGolds
  )
  .get(
    "/golds/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR", "Accountant"]),
    searchGolds
  )
  .get(
    "/csr/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getCsrs
  )
  .get(
    "/csr/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    searchCsrs
  )
  .get(
    "/players/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR"]),
    getPlayers
  )
  .get(
    "/players/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "CSR"]),
    searchPlayers
  )
  .get(
    "/moderators/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getModerators
  )
  .get(
    "/moderators/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    searchModerators
  )
  .get(
    "/accountants/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    getAccountants
  )
  .get(
    "/accountants/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    searchAccountants
  )
  .get(
    "/agent/subs/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer"]),
    getSubsByUserId
  )
  .get(
    "/agent/subs/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer"]),
    searchSubsByUserId
  )
  .get(
    "/agent/masters/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Sub"]),
    getMastersByUserId
  )
  .get(
    "/agent/masters/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Sub"]),
    searchMastersByUserId
  )
  .get(
    "/agent/golds/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Master"]),
    getGoldsByUserId
  )
  .get(
    "/agent/golds/:limit/:page/:filter/search",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Master"]),
    searchGoldByUserId
  )
  .get(
    "/agent/active/players/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getActivePlayerByUserId
  )
  .get(
    "/pending/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getPendingUsersById
  )
  .get(
    "/banned/:limit/:page/all",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    getBannedUsersById
  )
  .post("/register", createAgentPlayer)
  .post(
    "/create",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    createAuthoritative
  )
  .put(
    "/payment-mode",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold", "Player"]),
    updatePaymentMethod
  )
  .put(
    "/ban",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    banUser
  )
  .put(
    "/unban",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    unbanUser
  )
  .put(
    "/player/approve",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    approvePlayer
  )
  .put(
    "/agent/approve",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Financer", "Sub", "Master", "Gold"]),
    approveAgent
  );

module.exports = router;
