const mongoose = require("mongoose");
const { Schema } = mongoose;

const roundSchema = Schema(
  {
    arenaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arena",
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    outcome: {
      type: String,
      enum: {
        values: ["wala", "meron", "draw", "cancel", "-"],
        message: "{VALUE} is not a valid type.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Round = mongoose.model("Round", roundSchema);
module.exports = Round;
