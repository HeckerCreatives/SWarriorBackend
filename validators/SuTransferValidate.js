exports.suTransferisValid = data => {
  if (data.sender === "" || data.senderId === "") {
    return {
      isValid: false,
      msg: "Please select the sender.",
    };
  }

  if (data.receiver === "" || data.receiverId === "") {
    return {
      isValid: false,
      msg: "Please select the receiver.",
    };
  }

  if (
    isNaN(data.amount) ||
    data.amount === "" ||
    parseFloat(data.amount) <= 0
  ) {
    return {
      isValid: false,
      msg: "Amount must be greater than 0.",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
