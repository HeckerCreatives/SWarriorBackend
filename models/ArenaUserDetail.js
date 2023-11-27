const mongoose = require("mongoose");
const { Schema } = mongoose;

const arenaUserDetailSchema = Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    commisionRate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ArenaUserDetail = mongoose.model(
  "ArenaUserDetail",
  arenaUserDetailSchema
);
module.exports = ArenaUserDetail;
