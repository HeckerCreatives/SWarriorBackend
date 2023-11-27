exports.isAgentValid = data => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{5,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!usernameRegex.test(data.username)) {
    return {
      isValid: false,
      msg: "Username must be atleast 6 characters and consist of letters, number and underscore.",
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

  if (data.country === "") {
    return {
      isValid: false,
      msg: "Please enter the country.",
    };
  }

  if (data.referrer === "") {
    return {
      isValid: false,
      msg: "Must have a referrer.",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
