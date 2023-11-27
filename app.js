const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const path = require("path");
const http = require("http");

const passport = require("passport");
const db = require("./config/db");
require("dotenv").config();
const corsConfig = require("./config/cors");

app.disable("x-powered-by");

app.use(morgan("dev"));
process.env.NODE_ENV === "production" && app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json({ limit: "50mb" }));

global.rootDir = path.resolve(__dirname);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(passport.initialize());

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "./client")));

const server = http.createServer(app);

require("./config/passport");

require("./routes")(app);

app.use(require("./middleware/gErrHandler"));

app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "./", "client", "build", "index.html"))
);

const port = process.env.PORT || 5000; // Dynamic port for deployment
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  db();
});
