exports.isPaymentMethodValid = data => {
  if (data.paymentMode === "") {
    return {
      isValid: false,
      msg: "Please enter the payment mode.",
    };
  }

  if (data.acctName === "") {
    return {
      isValid: false,
      msg: "Please enter the account name.",
    };
  }

  if (data.acctNumber === "") {
    return {
      isValid: false,
      msg: "Please enter the account number.",
    };
  }

  return {
    isValid: true,
    msg: "",
  };
};
