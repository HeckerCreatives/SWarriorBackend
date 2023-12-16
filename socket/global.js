const CustomError = require("../utils/custom-error");

let ioInstance = null;

const initializeSocket = io => {
  if (!ioInstance) ioInstance = io;
};

const getIOInstance = () => {
  if (!ioInstance) throw new CustomError("No Available WebSocket!", 500);
  return ioInstance;
};

module.exports = {
  initializeSocket,
  getIOInstance,
};
