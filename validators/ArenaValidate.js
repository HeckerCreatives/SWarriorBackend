exports.arenaIsValid = data => {
  const {
    arenaEventName,
    arenaLocation,
    eventCode,
    plasadaRate,
    arenaVideo,
    tieRate,
    eventType,
    drawEnabled,
  } = data;

  if (arenaEventName === "") {
    return {
      isValid: false,
      msg: "Arena event name is required",
    };
  }

  if (arenaLocation === "") {
    return {
      isValid: false,
      msg: "Arena location is required",
    };
  }

  if (eventCode === "") {
    return {
      isValid: false,
      msg: "Event code is required",
    };
  }

  if (plasadaRate === "") {
    return {
      isValid: false,
      msg: "Plasada rate is required",
    };
  }

  if (isNaN(plasadaRate)) {
    return {
      isValid: false,
      msg: "Plasada rate must be a number",
    };
  }

  if (plasadaRate < 12) {
    return {
      isValid: false,
      msg: "Plasada rate must be 12 or above",
    };
  }

  if (arenaVideo === "") {
    return {
      isValid: false,
      msg: "Arena video is required",
    };
  }

  if (drawEnabled && tieRate === "") {
    return {
      isValid: false,
      msg: "Tie rate is required",
    };
  }

  if (drawEnabled && isNaN(tieRate)) {
    return {
      isValid: false,
      msg: "Tie rate must be a number",
    };
  }

  if (eventType === "") {
    return {
      isValid: false,
      msg: "Event type is required",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
