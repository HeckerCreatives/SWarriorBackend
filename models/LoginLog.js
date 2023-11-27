const mongoose = require("mongoose");
const { Schema } = mongoose;

const loginLogSchema = Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LoginLog = mongoose.model("LoginLog", loginLogSchema);
module.exports = LoginLog;
