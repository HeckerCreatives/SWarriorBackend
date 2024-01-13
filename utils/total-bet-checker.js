const { betsByRoom } = require("../socket/socket");

exports.isTotalBetsValid = arenaId => {
  const totalBet1 = betsByRoom.get(`${arenaId}`)[`totalWala`];
  const totalBet2 = betsByRoom.get(`${arenaId}`)[`totalMeron`];

  const check1 = checkNumber(totalBet1, totalBet2);
  const check2 = checkNumber(totalBet2, totalBet1);

  if (totalBet1 === 0 && totalBet2 === 0) return false;

  if (check1 && check2) return true;
  return false;
};

const checkNumber = (bet1, bet2) => {
  const threshold = 0.8 * bet1;
  if (bet2 >= threshold) return true;
  return false;
};
