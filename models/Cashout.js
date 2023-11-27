const mongoose = require("mongoose");
const { Schema } = mongoose;

const cashoutSchema = Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    walletType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "done", "reject"],
        message: "{VALUE} is not a valid type.",
      },
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Cashout = mongoose.model("Cashout", cashoutSchema);
module.exports = Cashout;
