const routers = app => {
  app.use("/api/v1/auth", require("./Auths"));
  app.use("/api/v1/users", require("./Users"));
  app.use("/api/v1/roles", require("./Roles"));
  app.use("/api/v1/transfers", require("./Transfers"));
  app.use("/api/v1/wallets", require("./UserWallets"));
  app.use("/api/v1/commissions", require("./ArenaUserDetails"));
  app.use("/api/v1/cashouts", require("./Cashouts"));
  app.use("/api/v1/logs", require("./LoginLogs"));
  app.use("/api/v1/announcements", require("./Announcements"));
  app.use("/api/v1/dashboards", require("./Dashboard"));
  app.use("/api/v1/cashins", require("./Cashins"));
  app.use("/api/v1/videos", require("./Videos"));
  app.use("/api/v1/arenas", require("./Arenas"));
  app.use("/api/v1/bets", require("./Bets"));
  app.use("/api/v1/commission-histories", require("./CommissionHistories"));
  app.use("/api/v1/rounds", require("./Rounds"));
};

module.exports = routers;
