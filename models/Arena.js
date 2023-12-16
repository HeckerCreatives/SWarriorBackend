const mongoose = require("mongoose");
const { Schema } = mongoose;

const arenaSchema = Schema(
  {
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    fights: {
      type: Number,
      required: true,
      default: 0,
    },
    eventName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    eventCode: {
      type: String,
      required: true,
    },
    plasadaRate: {
      type: Number,
      required: true,
    },
    arenaVideo: {
      videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    tieRate: {
      type: Number,
    },
    eventType: {
      type: String,
      required: true,
    },
    drawEnabled: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["standby", "open", "close"],
        message: "{VALUE} is not a valid type.",
      },
      default: "standby",
    },
  },
  {
    timestamps: true,
  }
);

const Arena = mongoose.model("Arena", arenaSchema);
module.exports = Arena;
