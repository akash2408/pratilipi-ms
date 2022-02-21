if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const healthcheck = require("./routes/api");
const story = require("./routes/story");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8002;
const URI =
  process.env.URI ||
  "mongodb://nosql-db:27017/pratilipi-ms-story";

const connectWithRetry = (uris, options, maxAttempts = 5) => {
  connectWithRetry.timeout = connectWithRetry.timeout || 0;
  return mongoose.connect(uris, options, (err) => {
    if (err)
      if (connectWithRetry.timeout <= (maxAttempts - 1) * 5000) {
        console.error(
          `Failed to connect to mongo on startup - retrying in ${
            (connectWithRetry.timeout += 5000) / 1000
          } sec`,
          connectWithRetry.previousError != "" + err
            ? `\n${(connectWithRetry.previousError = err)}`
            : ""
        );
        setTimeout(connectWithRetry, connectWithRetry.timeout, uris, options);
      } else process.exit(1);
    else console.log("Connected to MongoDB successfully!");
  });
};

connectWithRetry(URI);
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(helmet());
app.use(
  cors({
    allowedHeaders: [
      "Content-Type",
      "token",
      "authorization",
      "*",
      "Content-Length",
      "X-Requested-With",
    ],
    origin: "*",
    preflightContinue: true,
  })
);
app.use(express.json({ limit: "1024mb" }));
app.use(express.urlencoded({ limit: "1024mb", extended: true }));

app.use("/", healthcheck);
app.use("/", story);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).send({ success: false, msg: err.message });
});

const server = require("http").createServer(app);

server.listen(port, () => {
  console.log("Story Server has started! on http://localhost:" + port + "/");
});
