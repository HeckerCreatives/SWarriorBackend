const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const {
  getTopPoints,
  getTopCommissions,
} = require("../controllers/UserWallets");

const router = require("express").Router();

router
  .get(
    `/top/:limit/:page/credit`,
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getTopPoints
  )
  .get(
    `/top/:limit/:page/commission`,
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin", "Accountant"]),
    getTopCommissions
  );

module.exports = router;
