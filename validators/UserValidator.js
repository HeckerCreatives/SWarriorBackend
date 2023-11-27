exports.isUserValid = data => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{5,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!usernameRegex.test(data.username)) {
    return {
      isValid: false,
      msg: "Username must be atleast 6 characters and consist of letters, number and underscore.",
    };
  }

  if (data.password === "") {
    return {
      isValid: false,
      msg: "Invalid Password",
    };
  }

  if (data.password.length < 6) {
    return {
      isValid: false,
      msg: "Password must be atleast 6 characters.",
    };
  }

  if (data.password !== data.confirm) {
    return {
      isValid: false,
      msg: "Password must match with confirm password.",
    };
  }

  if (data.email === "") {
    return {
      isValid: false,
      msg: "Please enter an email address.",
    };
  }

  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      msg: "Please enter a valid email.",
    };
  }

  if (isNaN(data.pin)) {
    return {
      isValid: false,
      msg: "Pin must be numbers.",
    };
  }

  if (data.pin.length !== 4) {
    return {
      isValid: false,
      msg: "Pin must be 4 numbers only",
    };
  }

  if (
    isNaN(data.phonenumber) ||
    data.phonenumber.length < 8 ||
    data.phonenumber.length > 15
  ) {
    return {
      isValid: false,
      msg: "Please enter a valid mobile number.",
    };
  }

  if (data.roleName === "Financer") {
    if (data.commisionrate == "") {
      return {
        isValid: false,
        msg: "Please select commision rate.",
      };
    }

    if (isNaN(data.commisionrate)) {
      return {
        isValid: false,
        msg: "Invalid Commision Rate",
      };
    }
  }

  return {
    isValid: true,
    msg: "",
  };
};
