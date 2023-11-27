const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const accountSchema = Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "blocked"],
        message: "{VALUE} is not a valid type.",
      },
      default: "pending",
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

accountSchema.methods.savePassword = function (pw) {
  this.password = bcrypt.hashSync(pw, 10);
};

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
