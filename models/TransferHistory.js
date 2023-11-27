const mongoose = require("mongoose");
const { Schema } = mongoose;

const transferHistorySchema = Schema(
  {
    action: {
      type: String,
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TransferHistory = mongoose.model(
  "TransferHistory",
  transferHistorySchema
);
module.exports = TransferHistory;
