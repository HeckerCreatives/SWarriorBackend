exports.announcementIsValid = data => {
  if (data.title === "") {
    return {
      isValid: false,
      msg: "Title is required",
    };
  }

  if (data.description === "") {
    return {
      isValid: false,
      msg: "Description is required",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
