const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const { adminCashin } = require("../controllers/Cashins");

const router = require("express").Router();

router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAuthorize(["Superadmin"]),
  adminCashin
);

module.exports = router;
