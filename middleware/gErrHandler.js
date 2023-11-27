globalErrorHandler = (err, req, res, next) => {
  const error = {
    message: "Internal Error",
    success: false,
  };

  if (err.statusCode) {
    error.message = err.message;
    res.status(err.statusCode);
  } else {
    res.status(500);
  }

  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack;
  }

  console.log(err.stack);

  res.json({ error });
};

module.exports = globalErrorHandler;
