const passport = require("passport");
const { isAuthorize } = require("../middleware/authorize");
const { getRoles } = require("../controllers/Roles");

const router = require("express").Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAuthorize(["Superadmin"]),
  getRoles
);

module.exports = router;
