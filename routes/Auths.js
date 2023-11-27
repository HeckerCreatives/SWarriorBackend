const passport = require("passport");
const { login, changeAgentPassword } = require("../controllers/Auths");
const { isAuthorize } = require("../middleware/authorize");

const router = require("express").Router();

router
  .post("/login", login)
  .put(
    "/agent/password",
    passport.authenticate("jwt", { session: false }),
    isAuthorize(["Superadmin"]),
    changeAgentPassword
  );

module.exports = router;
