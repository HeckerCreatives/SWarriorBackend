const mongoose = require("mongoose");
const { Schema } = mongoose;

const betSchema = Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arena",
      required: true,
    },
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    bet: {
      type: String,
      enum: {
        values: ["wala", "meron", "draw"],
        message: "{VALUE} is not a valid type.",
      },
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isClaimed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Bet = mongoose.model("Bet", betSchema);
module.exports = Bet;
