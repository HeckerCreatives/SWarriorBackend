const mongoose = require("mongoose");
const { Schema } = mongoose;

const userDetailSchema = Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    fullname: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    country: {
      type: String,
    },
    pin: {
      type: Number,
    },
    bankAcctName: {
      type: String,
    },
    bankAcctNumber: {
      type: String,
    },
    paymentMode: {
      type: String,
    },
    bankAcctAddDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserDetail = mongoose.model("UserDetail", userDetailSchema);
module.exports = UserDetail;
