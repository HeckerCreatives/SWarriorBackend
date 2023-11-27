const { default: mongoose } = require("mongoose");

exports.isIdValid = id => mongoose.Types.ObjectId.isValid(id);
