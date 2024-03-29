exports.betIsValid = (bet, amount, drawEnabled, didBet) => {
  const validBets = ["wala", "meron"];
  if (drawEnabled) validBets.push("draw");

  if (!didBet || didBet.bet === bet) {
    if (!validBets.includes(bet)) {
      return {
        isValid: false,
        msg: "Invalid bet",
      };
    }

    if (isNaN(amount)) {
      return {
        isValid: false,
        msg: "Invalid amount",
      };
    }

    if (+amount < 1) {
      return {
        isValid: false,
        msg: "Amount must be greater than 1",
      };
    }

    return {
      isValid: true,
      msg: "",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
