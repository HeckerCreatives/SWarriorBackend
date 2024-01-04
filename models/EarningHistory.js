const mongoose = require("mongoose");
const { Schema } = mongoose;

const earningHistorySchema = Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["draw"],
        message: "{VALUE} is not a valid type.",
      },
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

const EarningHistory = mongoose.model("EarningHistory", earningHistorySchema);
module.exports = EarningHistory;
