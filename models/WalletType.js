const mongoose = require("mongoose");
const { Schema } = mongoose;

const walletTypeSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WalletType = mongoose.model("WalletType", walletTypeSchema);
module.exports = WalletType;
