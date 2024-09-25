require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const errorHandler = require("./middleware/errorHandler");
const { logger, logEvents } = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const serverLandingPage = require("./routes/root");
const corsOptions = require("./config/corsOptions");
const dbConn = require("./config/dbConn");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const emergencyRoute = require("./routes/emergency");

const app = express();
const PORT = process.env.PORT || 3500;

dbConn();

app.use(logger);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(express.json());
app.use("/", serverLandingPage);

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/emergency", emergencyRoute);

app.all("*", notFound);
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Database connected successfully");
  app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
  });
});
mongoose.connection.on("error", (error) => {
  console.log(error);
  logEvents(
    `${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`,
    "mongoErrorLog.log"
  );
});
