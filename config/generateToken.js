const jwt = require("jsonwebtoken");

const generateToken = user => {
  return {
    access: jwt.sign(
      {
        _id: user._id,
        username: user.username,
        roleName: user.roleId.name,
        roleId: user.roleId._id,
      },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    ),
  };
};

module.exports = generateToken;
