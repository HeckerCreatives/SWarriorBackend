const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const { updateCommissionRate } = require("../controllers/ArenaUserDetails");

const router = require("express").Router();

router.put(
  "/commission-rate",
  passport.authenticate("jwt", { session: false }),
  isAuthorize(["Superadmin", "CSR", "Financer", "Sub", "Master", "Gold"]),
  updateCommissionRate
);

module.exports = router;
