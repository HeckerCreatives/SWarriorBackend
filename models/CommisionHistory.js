const mongoose = require("mongoose");
const { Schema } = mongoose;

const commisionHistorySchema = Schema(
  {
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
    arena: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommisionHistory = mongoose.model(
  "CommisionHistory",
  commisionHistorySchema
);
module.exports = CommisionHistory;
