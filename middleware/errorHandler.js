const { logEvents } = require("./logger");

const devError = (err, res) => {
  res.status(err.status).json({
    message: err.message,
    isError: true,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  res.status(err.status).json({
    message: err.message,
    isError: true,
  });
};

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  err.status = err.status || 500;
  if (process.env.NODE_ENV == "development") {
    devError(err, res);
  } else {
    prodError(err, res);
  }
};

module.exports = errorHandler;
