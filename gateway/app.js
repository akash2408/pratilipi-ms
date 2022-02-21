if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const proxy = require("express-http-proxy")
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

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

const isMultipartRequest = (req) => {
  const contentTypeHeader = req.headers["content-type"];
  return contentTypeHeader && contentTypeHeader.indexOf("multipart") > -1;
};

const proxyMiddleware = (req, res, next) => {
  return proxy("http://story:8002", {
    parseReqBody: !isMultipartRequest(req),
    // your other fields here...
  })(req, res, next);
};

app.get('/',function(req,res){
  res.send("hello iam api gateway");
});

app.use("/api/story", proxyMiddleware);
app.use("/api/user", proxy("http://user:8001"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).send({ success: false, error: err.message });
});

const server = require("http").createServer(app);

server.listen(port, () => {
  console.log("Gateway has started! on http://localhost:" + port + "/");
});
