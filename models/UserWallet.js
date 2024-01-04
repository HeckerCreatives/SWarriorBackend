const mongoose = require("mongoose");
const { Schema } = mongoose;

const userWalletSchema = Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: {
        values: ["commission", "credit", "draw"],
        message: "{VALUE} is not a valid type.",
      },
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserWallet = mongoose.model("UserWallet", userWalletSchema);
module.exports = UserWallet;
