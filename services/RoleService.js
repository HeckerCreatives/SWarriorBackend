const Role = require("../models/Role");
const CustomError = require("../utils/custom-error");

exports.getRoles = async () => {
  try {
    const roles = await Role.find({ level: 2 }, { name: 1 }).exec();
    return {
      success: true,
      roles,
    };
  } catch (error) {
    console.log("GET_ROLES", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
