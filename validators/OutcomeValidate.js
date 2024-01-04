exports.outcomeIsValid = (outcome, drawEnabled) => {
  const outcomes = ["wala", "meron", "cancel"];
  drawEnabled && outcomes.push("draw");

  if (!outcomes.includes(outcome)) {
    return {
      isValid: false,
      msg: "Invalid result.",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
