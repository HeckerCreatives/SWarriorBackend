exports.videoIsValid = data => {
  const { name, url } = data;

  if (name === "") {
    return {
      isValid: false,
      msg: "Video name is required.",
    };
  }

  if (url === "") {
    return {
      isValid: false,
      msg: "Video url is required.",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
