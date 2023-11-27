const Account = require("../models/Account");
const { isIdValid } = require("../utils/check-id");
const CustomError = require("../utils/custom-error");

exports.changeAgentPassword = async data => {
  try {
    if (!isIdValid(data.agentId)) throw new CustomError("Invalid Agent", 400);

    if (data.password === "")
      throw new CustomError("Password is required", 400);

    if (data.password.length < 6)
      throw new CustomError("Password must be atleast 6 characters", 400);

    if (data.password !== data.confirm)
      throw new CustomError("Password must match the Confirm password", 400);

    const agent = await Account.findOne({ _id: data.agentId }).exec();
    if (!agent) throw new CustomError("Invalid agent", 400);
    if (agent.username !== data.agent)
      throw new CustomError("Invalid agent", 400);

    agent.password = data.password;
    agent.markModified("password");
    agent.savePassword(data.password);
    await agent.save();

    return { success: true };
  } catch (error) {
    console.log("CHANGE_PASSWORD", error);
    throw new CustomError(error.message, error.statusCode || 500);
  }
};
